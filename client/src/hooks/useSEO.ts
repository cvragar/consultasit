import { useEffect } from "react";

interface SEOOptions {
  /** Títol de la pàgina (30-60 caràcters recomanats) */
  title: string;
  /** Descripció per a meta description (opcional, sobreescriu la global) */
  description?: string;
  /** URL canònica de la pàgina (sense paràmetres de consulta) */
  canonicalPath: string;
  /** Si true, afegeix <meta name="robots" content="noindex, nofollow"> */
  noindex?: boolean;
}

const BASE_URL = "https://www.consultesit.com";

/**
 * Hook reutilitzable per gestionar el SEO de cada pàgina:
 * - Actualitza document.title
 * - Afegeix/actualitza <link rel="canonical"> per evitar contingut duplicat
 * - Afegeix/actualitza <meta name="description"> si es proporciona
 */
export function useSEO({ title, description, canonicalPath, noindex }: SEOOptions) {
  useEffect(() => {
    // 1. Actualitzar el títol de la pàgina
    document.title = title;

    // 2. Gestionar el link canonical
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;
    let canonicalEl = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute("href", canonicalUrl);

    // 3. Actualitzar meta description si es proporciona
    if (description) {
      let metaDesc = document.querySelector<HTMLMetaElement>("meta[name='description']");
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }

    // 4. Gestionar meta robots (noindex)
    let metaRobots = document.querySelector<HTMLMetaElement>("meta[name='robots']");
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement("meta");
        metaRobots.setAttribute("name", "robots");
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute("content", "noindex, nofollow");
    } else {
      // Si la pàgina és indexable, eliminar el noindex si existia d'una pàgina anterior
      if (metaRobots && metaRobots.getAttribute("content") === "noindex, nofollow") {
        metaRobots.setAttribute("content", "index, follow");
      }
    }

    // Neteja: restaurar el títol per defecte en desmontar (opcional)
    return () => {
      // No restaurem per evitar flash de títol incorrecte en navegació
    };
  }, [title, description, canonicalPath, noindex]);
}
