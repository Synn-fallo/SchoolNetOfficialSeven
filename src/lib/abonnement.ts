export async function isEtablissementAbonne(etablissementId: string): Promise<boolean> {
  // Simple subscription status helper. Defaults to true for the demo.
  console.log(`[Abonnement] Checking subscription status for school: ${etablissementId}`);
  return true;
}
