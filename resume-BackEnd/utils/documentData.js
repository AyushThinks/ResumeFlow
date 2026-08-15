"use strict";

const { Item, Section } = require("../models");
const { cleanText } = require("./validation");

const MAX_SECTIONS = 30;
const MAX_ITEMS_PER_SECTION = 100;

async function loadSections(documentId, transaction) {
  const rows = await Section.findAll({
    where: { documentId },
    include: [{ model: Item }],
    order: [
      ["position", "ASC"],
      [Item, "position", "ASC"],
    ],
    transaction,
  });

  return rows.map((row) => {
    const section = row.toJSON();
    section.items = section.Items || [];
    delete section.Items;
    delete section.Document;
    return section;
  });
}

function normalizeSections(value) {
  if (!Array.isArray(value) || value.length > MAX_SECTIONS) {
    return null;
  }

  const sections = [];

  for (const source of value) {
    const heading = cleanText(source?.heading, { min: 2, max: 100 });
    const sourceItems = Array.isArray(source?.items) ? source.items : [];

    if (!heading || sourceItems.length > MAX_ITEMS_PER_SECTION) {
      return null;
    }

    const items = [];

    for (const sourceItem of sourceItems) {
      const rawContent = typeof sourceItem === "string"
        ? sourceItem
        : sourceItem?.content;
      const content = cleanText(rawContent, { min: 1, max: 5000 });

      if (!content) {
        return null;
      }

      items.push(content);
    }

    sections.push({
      heading,
      isSidebar: source.isSidebar === true,
      items,
    });
  }

  return sections;
}

async function createSections(documentId, value, transaction) {
  const sections = normalizeSections(value);

  if (!sections) {
    const error = new Error("Invalid document sections.");
    error.name = "DocumentContentValidationError";
    throw error;
  }

  for (let sectionPosition = 0; sectionPosition < sections.length; sectionPosition += 1) {
    const source = sections[sectionPosition];
    const section = await Section.create(
      {
        documentId,
        heading: source.heading,
        position: sectionPosition,
        isSidebar: source.isSidebar,
      },
      { transaction },
    );

    if (source.items.length) {
      await Item.bulkCreate(
        source.items.map((content, position) => ({
          sectionId: section.id,
          content,
          position,
        })),
        { transaction },
      );
    }
  }
}

module.exports = {
  createSections,
  loadSections,
  normalizeSections,
};
