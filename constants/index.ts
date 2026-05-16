import {
  LayoutDashboard,
  FileText,
  ImageIcon,
  Film,
  FolderArchive,
  Pencil,
  Info,
  Share2,
  Download,
  Trash2,
} from "lucide-react";

export const siteConfig = {
  name: "Nimbus",
  title: "Nimbus — Cloud storage that gets out of your way",
  shortTitle: "Nimbus",
  description:
    "A modern cloud workspace for your files. Upload, organize, share, and access anywhere — encrypted in transit and at rest, built on Appwrite, Next.js, and shadcn/ui.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://nimbus-storage-app.vercel.app",
  ogImage: "/opengraph-image",
  author: "Mark Yu",
  authorUrl: "https://m4rkyu.com",
  repoUrl: "https://github.com/zhenxiao-yu/nimbus-storage-app",
  keywords: [
    "cloud storage",
    "file management",
    "Appwrite",
    "Next.js 15",
    "React 19",
    "shadcn/ui",
    "Tailwind CSS",
    "TypeScript",
    "Mark Yu",
    "portfolio",
  ],
};

export const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { name: "Documents", icon: FileText, url: "/dashboard/documents" },
  { name: "Images", icon: ImageIcon, url: "/dashboard/images" },
  { name: "Media", icon: Film, url: "/dashboard/media" },
  { name: "Others", icon: FolderArchive, url: "/dashboard/others" },
];

export const actionsDropdownItems = [
  { label: "Rename", icon: Pencil, value: "rename" },
  { label: "Details", icon: Info, value: "details" },
  { label: "Share", icon: Share2, value: "share" },
  { label: "Download", icon: Download, value: "download" },
  { label: "Delete", icon: Trash2, value: "delete" },
] as const;

export const sortTypes = [
  { label: "Date created (newest)", value: "$createdAt-desc" },
  { label: "Date created (oldest)", value: "$createdAt-asc" },
  { label: "Name (A → Z)", value: "name-asc" },
  { label: "Name (Z → A)", value: "name-desc" },
  { label: "Size (largest)", value: "size-desc" },
  { label: "Size (smallest)", value: "size-asc" },
];

export const avatarPlaceholderUrl =
  "https://api.dicebear.com/9.x/initials/svg?seed=Nimbus";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const TOTAL_BUCKET_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export const FILE_TYPE_LABEL: Record<string, string> = {
  documents: "Documents",
  images: "Images",
  media: "Media",
  others: "Others",
};
