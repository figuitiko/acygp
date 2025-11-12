import { WorkerBoxProps } from "../../components/about/worker-box";

export const workersData: WorkerBoxProps[] = [
  {
    workerName: "Juan Pérez",
    workerImgSrc: "/images/about/placeholder.webp",
    workerRole: "Consultor Senior",
    workerDescription:
      "Especialista en normativas laborales con más de 10 años de experiencia.",
  },
  {
    workerName: "María Gómez",
    workerImgSrc: "/images/about/placeholder.webp",
    workerRole: "Asesora Legal",
    workerDescription:
      "Experta en asesoría legal para empresas en cumplimiento laboral.",
  },
  {
    workerName: "Carlos Rodríguez",
    workerImgSrc: "/images/about/placeholder.webp",
    workerRole: "Capacitador",
    workerDescription:
      "Encargado de desarrollar programas de capacitación integral.",
  },
];

export const SECTION_INFO_1 = {
  heading: "Beneficios de la Certificación",
  topics: [
    "Tiene validez a nivel nacional e internacional y es reconocida por la SEP.",
    "Obtienes un número de registro y tu competencia se acredita antes las instituciones públicas y privadas de manera oficial.",
    "Obtienes un reconocimiento oficial de tus hábildiades por el  CONOCER y es avalado por la SEP con valor oficial",
    "Mejores oportunidades laborales.",
    "Pontencial para aumentar tus ingresos.",
    "Movilidad y reconocimiento nacional y algunos sectores internacionales.",
    "Desarrollo profesional continuo.",
  ],
};

export const SECTION_INFO_2 = {
  heading: "Requisitos",
  topics: [
    "Fotografía digitalizada reciente en formato infantil, de frente, rostro descubierto, con ropa formal a COLOR y fondo blanco (no gris, no beige; no se aceptarán fotografías “pixeladas”, borrosas, manchadas, con marcas o del papel fotográfico de origen)",
    "Copia de identificación oficial (INE, cédula profesional y/o cartilla militar) por ambos lados y en tamaño media carta, que sea legible.",
    "Copia de Clave Única de Registro de Población (CURP) formato descargable de internet.",
    "Comprobante original de pago correspondiente",
  ],
  CTA: {
    headingCTA: "DESCARGA EL FORMULARIO DE REGISTRO",
    itemsCTA: [
      { title: "Sales Inquiries", email: "email@sample.com" },
      { title: "Customer Support", email: "email@sample.com" },
    ],
  },
};
