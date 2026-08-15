"use strict";

const TEMPLATE_NAMES = [
  "Classic",
  "Modern",
  "Technical",
  "Sidebar Gold",
  "Sidebar Teal",
  "Simple",
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const templates = [
      {
        name: "Classic",
        config: JSON.stringify({
          layout: "classic",
          category: "professional",
          accent: "#b7791f",
        }),
      },
      {
        name: "Modern",
        config: JSON.stringify({
          layout: "modern",
          category: "modern",
          accent: "#f5a623",
        }),
      },
      {
        name: "Technical",
        config: JSON.stringify({
          layout: "technical",
          category: "engineering",
          accent: "#ff6b5e",
        }),
      },
      {
        name: "Sidebar Gold",
        config: JSON.stringify({
          layout: "sidebar",
          category: "creative",
          accent: "#f5a623",
        }),
      },
      {
        name: "Sidebar Teal",
        config: JSON.stringify({
          layout: "sidebar",
          category: "creative",
          accent: "#0f9f8f",
        }),
      },
      {
        name: "Simple",
        config: JSON.stringify({
          layout: "simple",
          category: "minimal",
          accent: "#6b7280",
        }),
      },
    ].map((template) => ({
      ...template,
      createdAt: now,
      updatedAt: now,
    }));

    const [existing] = await queryInterface.sequelize.query(
      "SELECT name FROM Templates WHERE name IN (:names)",
      {
        replacements: { names: TEMPLATE_NAMES },
      },
    );
    const existingNames = new Set(existing.map((row) => row.name));
    const missing = templates.filter(
      (template) => !existingNames.has(template.name),
    );

    if (missing.length) {
      await queryInterface.bulkInsert("Templates", missing);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Templates", {
      name: { [Sequelize.Op.in]: TEMPLATE_NAMES },
    });
  },
};
