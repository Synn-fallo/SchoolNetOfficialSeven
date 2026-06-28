import { useState, useEffect } from "react";

export interface Annonce {
  id: string;
  type: "etablissement" | "classe";
  title: string;
  content: string;
  author: string;
  authorRole: string;
  date: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  tags?: string[];
}

const INITIAL_ANNONCES: Annonce[] = [
  {
    id: "1",
    type: "etablissement",
    title: "🔬 Grande Journée Portes Ouvertes & Exposition Scientifique 2026",
    content: "Nous avons le plaisir de vous convier à l'exposition annuelle des projets scientifiques de nos élèves de terminale et première. Venez découvrir leurs innovations, maquettes et expériences interactives ce vendredi à partir de 14h dans le grand hall d'honneur. Présence vivement souhaitée pour encourager nos futurs génies !",
    author: "Proviseur Mme Diop",
    authorRole: "Administration",
    date: "Aujourd'hui à 10:15",
    likes: 24,
    liked: false,
    commentsCount: 5,
    tags: ["Événement", "Science", "Portes Ouvertes"]
  },
  {
    id: "2",
    type: "etablissement",
    title: "📅 Calendrier révisé des examens du 3ème Trimestre",
    content: "Le calendrier officiel des épreuves du troisième trimestre a été mis à jour afin d'éviter tout chevauchement avec les jours fériés nationaux. Les fiches d'examen individuelles ont été distribuées aux élèves aujourd'hui. Veuillez vous assurer que votre enfant a bien entamé ses révisions.",
    author: "M. Kamara",
    authorRole: "Censeur des Études",
    date: "Hier à 14:30",
    likes: 42,
    liked: true,
    commentsCount: 12,
    tags: ["Examens", "Planning", "Trimestre 3"]
  },
  {
    id: "3",
    type: "classe",
    title: "📝 Devoir surveillé de Mathématiques - Terminale S1",
    content: "Rappel à tous les élèves de Terminale S1 : Le devoir surveillé commun de Mathématiques aura lieu le mardi 30 Juin. Le programme portera sur l'intégralité des chapitres d'intégration, de probabilités continues et d'équations différentielles. Munissez-vous de vos calculatrices scientifiques homologuées.",
    author: "M. Sow",
    authorRole: "Professeur de Mathématiques",
    date: "Hier à 09:12",
    likes: 15,
    liked: false,
    commentsCount: 3,
    tags: ["Mathématiques", "Devoir Surveillé"]
  },
  {
    id: "4",
    type: "classe",
    title: "📘 Lecture obligatoire - Programme de Français",
    content: "Pour le prochain cours de littérature comparée, tous les élèves de Première doivent avoir achevé la lecture des chapitres 1 à 5 de l'ouvrage phare étudié ce trimestre. Une courte interrogation de lecture de 10 minutes sera organisée en début de séance.",
    author: "Mme Fall",
    authorRole: "Professeure de Français",
    date: "Il y a 2 jours",
    likes: 8,
    liked: false,
    commentsCount: 1,
    tags: ["Français", "Lecture"]
  }
];

export function useAnnonces() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnonces = () => {
    return new Promise<Annonce[]>((resolve) => {
      setTimeout(() => {
        resolve(INITIAL_ANNONCES);
      }, 400);
    });
  };

  const refetch = async () => {
    setLoading(true);
    try {
      const data = await fetchAnnonces();
      setAnnonces(data);
      setError(null);
    } catch (err) {
      setError("Impossible de charger les annonces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    annonces,
    loading,
    error,
    refetch
  };
}
