import {
  DashBoard,
  Graph,
  Bank,
  ClipBoard,
  Chart,
  User,
  Application
} from "@/components/svg";
import { FileText } from "lucide-react";

export const menusConfig = {
  mainNav: [

    {
      title: "Finanzas",
      icon: Bank,
      child: [
        {
          title: "Dashboard",
          href: "/financedash",
          icon: Graph,
        },
        {
          title: "Transacciones",
          href: "/transactions",
          icon: DashBoard,
        },
        {
          title: "Cuentas",
          href: "/cuentas",
          icon: Bank,
        },
        {
          title: "Categorías",
          href: "/categorias",
          icon: ClipBoard,
        },
        {
          title: "Reportes",
          href: "/reportes",
          icon: Chart,
        },
      ],
    },
    {
      title: "Usuarios",
      icon: User,
      href: "/users",
    },
    {
      title: "Proyectos",
      icon: ClipBoard,
      href: "/projects",
    },
    {
      title: "Taller",
      icon: Application,
      href: "/cars",
    },
    {
      title: "Clientes (CRM)",
      icon: User,
      href: "/clients",
    },
    {
      title: "Inventario",
      icon: Application,
      href: "/inventory/products",
    }
  ],
  sidebarNav: {
    classic: [
      {
        isHeader: true,
        title: "Principal",
      },

      {
        title: "Usuarios",
        icon: User,
        href: "/users",
      },
      {
        isHeader: true,
        title: "Módulos Integrados",
      },
      {
        title: "Finanzas",
        icon: Bank,
        href: "/finance", // This is just the parent wrapper in the menu
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Dashboard",
            href: "/financedash",
            icon: Graph,
          },
          {
            title: "Transacciones",
            href: "/transactions",
            icon: DashBoard,
          },
          {
            title: "Cuentas",
            href: "/cuentas",
            icon: Bank,
          },
          {
            title: "Categorías",
            href: "/categorias",
            icon: ClipBoard,
          },
          {
            title: "Reportes",
            href: "/reportes",
            icon: Chart,
          },
        ],
      },
      {
        title: "Documentos",
        icon: ClipBoard,
        href: "/cotizaciones",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Cotizaciones",
            href: "/cotizaciones",
            icon: FileText,
          }
        ]
      },
      {
        title: "Proyectos",
        icon: ClipBoard,
        href: "/projects",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Todos los Proyectos",
            href: "/projects",
            icon: FileText,
          }
        ]
      },
      {
        title: "Taller",
        icon: Application,
        href: "/cars",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Taller en Vivo (Kanban)",
            href: "/kanban",
            icon: Application,
          },
          {
            title: "Vehículos",
            href: "/cars",
            icon: Application,
          }
        ]
      },
      {
        title: "Clientes",
        icon: User,
        href: "/clients",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Directorio",
            href: "/clients",
            icon: FileText,
          }
        ]
      },
      {
        title: "Citas",
        icon: ClipBoard,
        href: "/calendar",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Calendario",
            href: "/calendar",
            icon: Application,
          }
        ]
      },
      {
        title: "Inventario",
        icon: ClipBoard,
        href: "/inventory/products",
        isOpen: true,
        isHide: false,
        child: [
          {
            title: "Productos",
            href: "/inventory/products",
            icon: FileText,
          },
          {
            title: "Activos",
            href: "/inventory/assets",
            icon: FileText,
          },
          {
            title: "Categorías",
            href: "/inventory/categories",
            icon: FileText,
          }
        ]
      }
    ],
  },
};
