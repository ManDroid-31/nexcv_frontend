import { Azurill } from "./azurill";
import { Bronzor } from "./bronzor";
import { Chikorita } from "./chikorita";
import { Ditto } from "./ditto";
import { Gengar } from "./gengar";
import { Glalie } from "./glalie";
import { Kakuna } from "./kakuna";
import { Leafish } from "./leafish";
import { Nosepass } from "./nosepass";
import { Onyx } from "./onyx";
import { Pikachu } from "./pikachu";
import { Rhyhorn } from "./rhyhorn";
import type { TemplateProps } from "../../types/template";
import React from "react";

// Map UI template names to actual template components
export const templateMap: Record<string, React.ComponentType<TemplateProps>> = {
  modern: Onyx,
  executive: Bronzor,
  creative: Ditto,
  academic: Chikorita,
  minimal: Leafish,
  startup: Azurill,
  // fallback to Onyx for unknown
  azurill: Azurill,
  bronzor: Bronzor,
  chikorita: Chikorita,
  ditto: Ditto,
  gengar: Gengar,
  glalie: Glalie,
  kakuna: Kakuna,
  leafish: Leafish,
  nosepass: Nosepass,
  onyx: Onyx,
  pikachu: Pikachu,
  rhyhorn: Rhyhorn,
};

export const getTemplate = (template: string) => {
  return templateMap[template] || Onyx;
};

// Default layouts for each template
const TEMPLATE_DEFAULT_LAYOUTS: Record<string, any> = {
  onyx: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  pikachu: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  gengar: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  kakuna: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  azurill: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  chikorita: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  leafish: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  ditto: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  bronzor: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  rhyhorn: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  nosepass: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
  glalie: {
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    spacing: { sectionGap: 32, paragraphGap: 16, lineHeight: 1.5 },
    scale: 1,
  },
};

export function getTemplateDefaultLayout(templateId: string) {
  return TEMPLATE_DEFAULT_LAYOUTS[templateId] || TEMPLATE_DEFAULT_LAYOUTS["onyx"];
}
