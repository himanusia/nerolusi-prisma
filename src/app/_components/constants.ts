export interface Subject {
  id: number;
  title: string;
  image: string;
  slug: string;
}

export interface SubjectCategory {
  type: string;
  subjects: Subject[];
}

export const SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    type: "wajib",
    subjects: [
      {
        id: 1,
        title: "Matematika Wajib",
        image: "/subject/math-wajib.png",
        slug: "matematika-wajib",
      },
      {
        id: 2,
        title: "Bahasa Indonesia",
        image: "/subject/bindo.png",
        slug: "bahasa-indonesia",
      },
      {
        id: 3,
        title: "Bahasa Inggris",
        image: "/subject/bing.png",
        slug: "bahasa-inggris",
      },
    ],
  },
  {
    type: "saintek",
    subjects: [
      {
        id: 4,
        title: "Matematika Lanjut",
        image: "/subject/math-lanjut.png",
        slug: "matematika-lanjut",
      },
      {
        id: 5,
        title: "Fisika",
        image: "/subject/fisika.png",
        slug: "fisika",
      },
      {
        id: 6,
        title: "Kimia",
        image: "/subject/kimia.png",
        slug: "kimia",
      },
      {
        id: 7,
        title: "Biologi",
        image: "/subject/biologi.png",
        slug: "biologi",
      },
    ],
  },
  {
    type: "soshum",
    subjects: [
      {
        id: 8,
        title: "Ekonomi",
        image: "/subject/ekonomi.png",
        slug: "ekonomi",
      },
      {
        id: 9,
        title: "Sosiologi",
        image: "/subject/sosio.png",
        slug: "sosiologi",
      },
      {
        id: 10,
        title: "Geografi",
        image: "/subject/geo.png",
        slug: "geografi",
      },
      {
        id: 11,
        title: "Sejarah",
        image: "/subject/sejarah.png",
        slug: "sejarah",
      },
      // {
      //   id: 12,
      //   title: "PPKN",
      //   image: "/subject/ppkn.png",
      //   slug: "ppkn",
      // },
      // {
      //   id: 13,
      //   title: "Projek Kreatif & Kewirausahaan",
      //   image: "/subject/pkk.png",
      //   slug: "projek-kreatif-kewirausahaan",
      // },
    ],
  },
  {
    type: "modul_nerolusi",
    subjects: [
      {
        id: 19,
        title: "Modul Nerolusi 2026",
        image: "/modul/nerolusi.webp",
        slug: "nerolusi-2026",
      },
    ],
  },
  {
    type: "utbk",
    subjects: [
      {
        id: 12,
        title: "Pengetahuan dan Pemahaman Umum",
        image: "/modul/ppu.png",
        slug: "ppu",
      },
      {
        id: 13,
        title: "Kemampuan Penalaran Umum",
        image: "/modul/kpu.webp",
        slug: "kpu",
      },
      {
        id: 14,
        title: "Kemampuan Memahami Bacaan dan Menulis",
        image: "/modul/pbm.webp",
        slug: "pbm",
      },
      {
        id: 15,
        title: "Pengetahuan Kuantitatif",
        image: "/modul/pk.webp",
        slug: "pk",
      },
      {
        id: 16,
        title: "Penalaran Matematika",
        image: "/modul/pm.webp",
        slug: "pm",
      },
      {
        id: 17,
        title: "Literasi Bahasa Inggris",
        image: "/modul/lbing.webp",
        slug: "lbe",
      },
      {
        id: 18,
        title: "Literasi Bahasa Indonesia",
        image: "/modul/lbind.webp",
        slug: "lbi",
      },
    ],
  },
];

// Helper functions to get specific categories
export const getWajibSubjects = (): Subject[] => {
  return SUBJECT_CATEGORIES.find((cat) => cat.type === "wajib")?.subjects || [];
};

export const getSaintekSubjects = (): Subject[] => {
  return (
    SUBJECT_CATEGORIES.find((cat) => cat.type === "saintek")?.subjects || []
  );
};

export const getSoshumSubjects = (): Subject[] => {
  return (
    SUBJECT_CATEGORIES.find((cat) => cat.type === "soshum")?.subjects || []
  );
};

export const getAllSubjects = (): Subject[] => {
  return SUBJECT_CATEGORIES.flatMap((category) => category.subjects);
};

export const getUTBKSubjects = (): Subject[] => {
  return SUBJECT_CATEGORIES.find((cat) => cat.type === "utbk")?.subjects || [];
};

export const getUTBKModulSubjects = (): Subject[] => {
  return (
    SUBJECT_CATEGORIES.filter(
      (cat) => cat.type === "modul_nerolusi" || cat.type === "utbk",
    ).flatMap((cat) => cat.subjects) || []
  );
};

export const getSubjectBySlug = (slug: string): Subject | undefined => {
  return getAllSubjects().find((subject) => subject.slug === slug);
};

export const getSubjectByName = (name: string): Subject | undefined => {
  return getAllSubjects().find((subject) => subject.title === name);
};

export const getSlugBySubjectName = (name: string): string | undefined => {
  return getAllSubjects().find((subject) => subject.title === name)?.slug;
}

export const getSubjectType = (name: string): string | undefined => {
  return (
    SUBJECT_CATEGORIES.find((category) => subjectsInCategoryHasName(category, name))?.type
  );
};

const subjectsInCategoryHasName = (
  category: SubjectCategory,
  name: string,
): boolean => {
  return category.subjects.some((subject) => subject.title === name);
};