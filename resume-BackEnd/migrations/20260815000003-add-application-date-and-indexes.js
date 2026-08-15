"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Applications", "appliedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex("Documents", ["userId", "updatedAt"], {
      name: "documents_user_updated_at",
    });
    await queryInterface.addIndex("Sections", ["documentId", "position"], {
      name: "sections_document_position",
    });
    await queryInterface.addIndex("Items", ["sectionId", "position"], {
      name: "items_section_position",
    });
    await queryInterface.addIndex("Versions", ["documentId", "createdAt"], {
      name: "versions_document_created_at",
    });
    await queryInterface.addIndex("Applications", ["userId", "status"], {
      name: "applications_user_status",
    });
    await queryInterface.addIndex("Exports", ["userId", "createdAt"], {
      name: "exports_user_created_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("Exports", "exports_user_created_at");
    await queryInterface.removeIndex("Applications", "applications_user_status");
    await queryInterface.removeIndex("Versions", "versions_document_created_at");
    await queryInterface.removeIndex("Items", "items_section_position");
    await queryInterface.removeIndex("Sections", "sections_document_position");
    await queryInterface.removeIndex("Documents", "documents_user_updated_at");
    await queryInterface.removeColumn("Applications", "appliedAt");
  },
};
