import React, { useState } from "react";
import { MessageSquare, Heart, Bookmark, Share2, CornerDownRight } from "lucide-react";
import { Annonce } from "@/hooks/useAnnonces";

interface AnnonceCardProps {
  annonce: Annonce;
  onRefresh?: () => void;
  key?: React.Key;
}

export default function AnnonceCard({ annonce, onRefresh }: AnnonceCardProps) {
  const [likes, setLikes] = useState(annonce.likes);
  const [liked, setLiked] = useState(annonce.liked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; author: string; role: string; text: string; date: string }>>([
    {
      id: "c1",
      author: "M. N'diaye",
      role: "Parent (Moussa N'diaye)",
      text: "Merci pour cette information précieuse. Nous serons au rendez-vous !",
      date: "Il y a 3 heures"
    },
    {
      id: "c2",
      author: "Mme Touré",
      role: "Parent (Fatou Touré)",
      text: "Est-ce que l'événement est ouvert aux frères et sœurs plus jeunes ?",
      date: "Il y a 1 heure"
    }
  ]);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    if (liked) {
      setLikes(prev => prev - 1);
      setLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        author: "Vous",
        role: "Parent d'élève (Démo)",
        text: newComment.trim(),
        date: "À l'instant"
      }
    ]);
    setNewComment("");
  };

  const isEtablissement = annonce.type === "etablissement";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-5" id={`annonce-card-${annonce.id}`}>
      {/* Accent strip */}
      <div className={`h-1.5 ${isEtablissement ? "bg-schoolnet-primary" : "bg-schoolnet-secondary"}`} />

      <div className="p-6">
        {/* Author / Metadata Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isEtablissement ? "bg-blue-50 text-schoolnet-primary" : "bg-teal-50 text-schoolnet-secondary"} font-bold text-sm`}>
              {annonce.author.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-950 text-sm sm:text-base">{annonce.author}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isEtablissement ? "bg-blue-50 text-schoolnet-primary" : "bg-teal-50 text-schoolnet-secondary"
                }`}>
                  {annonce.authorRole}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium block mt-0.5">{annonce.date}</span>
            </div>
          </div>

          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
            isEtablissement 
              ? "bg-blue-50/70 text-schoolnet-primary border border-blue-100/50" 
              : "bg-teal-50/70 text-schoolnet-secondary border border-teal-100/50"
          }`}>
            {isEtablissement ? "🏫 Établissement" : "📚 Classe"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 hover:text-schoolnet-primary transition-colors leading-snug">
          {annonce.title}
        </h3>

        {/* Content */}
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 whitespace-pre-wrap">
          {annonce.content}
        </p>

        {/* Tags */}
        {annonce.tags && annonce.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {annonce.tags.map((tag, idx) => (
              <span key={idx} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Card Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/80 text-gray-500">
          <div className="flex items-center gap-1 sm:gap-4">
            {/* Like button */}
            <button 
              id={`like-btn-${annonce.id}`}
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all hover:bg-red-50 hover:text-red-500 ${
                liked ? "text-red-500 font-bold bg-red-50/50" : "text-gray-500"
              }`}
            >
              <Heart className={`h-4.5 w-4.5 transition-transform duration-300 ${liked ? "fill-red-500 scale-110" : "scale-100"}`} />
              <span>{likes}</span>
            </button>

            {/* Comment button */}
            <button 
              id={`comment-btn-${annonce.id}`}
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all hover:bg-blue-50 hover:text-schoolnet-primary ${
                showComments ? "text-schoolnet-primary font-bold bg-blue-50/50" : "text-gray-500"
              }`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              <span>{comments.length}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <button className="p-2 rounded-lg hover:bg-slate-50 text-gray-400 hover:text-slate-600 transition-colors" title="Sauvegarder">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-50 text-gray-400 hover:text-slate-600 transition-colors" title="Partager">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Comment Section (Collapsible) */}
        {showComments && (
          <div className="mt-5 pt-5 border-t border-gray-100 bg-slate-50/50 -mx-6 -mb-6 p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Commentaires ({comments.length})</h4>
            
            {/* List of comments */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 text-sm items-start">
                  <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-gray-600 shrink-0 mt-0.5">
                    {comment.author.charAt(0)}
                  </div>
                  <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-gray-100/80 shadow-2xs flex-1">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-xs">{comment.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{comment.date}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block -mt-1 mb-1">{comment.role}</span>
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-3" id={`comment-form-${annonce.id}`}>
              <input
                id={`comment-input-${annonce.id}`}
                type="text"
                placeholder="Votre message ou question..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 outline-none focus:border-schoolnet-primary focus:ring-1 focus:ring-blue-100 transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-schoolnet-primary text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-schoolnet-primary-light transition-all shadow-xs"
              >
                Envoyer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
