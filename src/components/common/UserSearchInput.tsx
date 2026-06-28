import React, { useState } from 'react';
import { Search, UserPlus, X, Loader2 } from 'lucide-react';
import { searchUserByEmail, UserSearchResult } from '@/utils/userSearch';

interface UserSearchInputProps {
  /** Callback appelé quand un utilisateur est sélectionné */
  onUserSelected?: (user: UserSearchResult) => void;
  /** Callback appelé quand la recherche est annulée / utilisateur désélectionné */
  onUserCleared?: () => void;
  /** Placeholder du champ de recherche */
  placeholder?: string;
  /** Valeur initiale (email pré-rempli) */
  initialEmail?: string;
  /** Désactiver le composant */
  disabled?: boolean;
}

export default function UserSearchInput({
  onUserSelected,
  onUserCleared,
  placeholder = "Email de l'utilisateur",
  initialEmail = '',
  disabled = false,
}: UserSearchInputProps) {
  const [email, setEmail] = useState(initialEmail);
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<UserSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!email.trim()) {
      setError('Veuillez saisir un email');
      return;
    }

    setSearching(true);
    setError(null);
    setFoundUser(null);

    try {
      const user = await searchUserByEmail(email);
      
      if (user) {
        setFoundUser(user);
        onUserSelected?.(user);
      } else {
        setError('Aucun utilisateur trouvé avec cet email');
        onUserCleared?.();
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Erreur lors de la recherche');
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setEmail('');
    setFoundUser(null);
    setError(null);
    onUserCleared?.();
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Search Input and Button */}
      <form onSubmit={handleSearch} className="flex gap-3 items-stretch">
        <div className="relative flex-1 flex items-center">
          <input
            type="email"
            disabled={disabled || !!foundUser}
            placeholder={placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (foundUser) {
                setFoundUser(null);
                onUserCleared?.();
              }
              if (error) setError(null);
            }}
            className={`
              w-full px-4 py-2.5 rounded-xl border text-xs font-bold bg-white text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              ${disabled || !!foundUser ? 'bg-slate-50 border-slate-150 text-slate-400 cursor-not-allowed' : 'border-slate-200'}
            `}
          />
        </div>

        {!foundUser ? (
          <button
            type="submit"
            disabled={disabled || searching || !email.trim()}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all select-none cursor-pointer focus:outline-none focus:ring-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recherche...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Rechercher</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClear}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <p className="text-xs font-bold text-rose-600 tracking-wide mt-1 animate-pulse">
          {error}
        </p>
      )}

      {/* User Found Card */}
      {foundUser && (
        <div className="flex items-center gap-4 bg-blue-50/45 border border-blue-150 rounded-2xl p-4 mt-2 transition-all">
          <div className="w-12 h-12 rounded-full bg-white text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
            <UserPlus size={22} className="stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-extrabold text-slate-800 truncate">
              {foundUser.prenom} {foundUser.nom}
            </h4>
            <p className="text-[11px] font-bold text-slate-500 truncate mt-0.5">
              {foundUser.email}
            </p>
            {foundUser.telephone && (
              <p className="text-[11px] font-bold text-slate-400 truncate mt-1 flex items-center gap-1">
                <span>📞</span>
                <span>{foundUser.telephone}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
