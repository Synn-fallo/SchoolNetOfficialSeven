import { supabase } from './supabase.web';

export async function getUnreadNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Envoyer une notification in-app
 * @param userId - ID de l'utilisateur destinataire
 * @param titre - Titre de la notification
 * @param message - Message de la notification
 * @param metadata - Métadonnées supplémentaires
 */
export async function sendInAppNotification(
  userId: string,
  titre: string,
  message: string,
  metadata?: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        titre,
        message,
        type: metadata?.type || 'info',
        metadata: metadata || {},
        is_read: false,
        created_at: new Date().toISOString(),
      });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending in-app notification:', error);
    return false;
  }
}

/**
 * Envoyer un email via le service d'emails (Edge Function ou service tiers)
 * @param params - Paramètres de l'email
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<boolean> {
  try {
    // Utiliser l'Edge Function send-email si disponible
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: params.to,
        subject: params.subject,
        html: params.html,
        from: params.from || 'noreply@schoolnet.bj',
      },
    });
    
    if (error) throw error;
    return data?.success || false;
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback: log l'email pour le debug
    console.log('Email would be sent to:', params.to);
    console.log('Subject:', params.subject);
    return false;
  }
}
