"use strict";

const assert = require("node:assert/strict");
const { after, test } = require("node:test");

const db = require("../models");

test("core models and ownership associations are registered", () => {
  assert.ok(db.User);
  assert.ok(db.Document);
  assert.ok(db.Section);
  assert.ok(db.Item);
  assert.ok(db.Application);
  assert.ok(db.Document.associations.User);
  assert.ok(db.Document.associations.Sections);
  assert.ok(db.Section.associations.Items);
  assert.ok(db.Application.associations.User);
});

test("sidebar and application date fields exist in the model schema", () => {
  assert.equal(db.Section.rawAttributes.isSidebar.allowNull, false);
  assert.ok(db.Application.rawAttributes.appliedAt);
  assert.ok(db.Document.rawAttributes.type.values.includes("cv"));
});

test("user creation hook hashes a changed password", async () => {
  const user = db.User.build({
    name: "Test User",
    email: "TEST@EXAMPLE.COM",
    password: "password-123",
  });

  await user.validate();
  await db.User.runHooks("beforeCreate", user);

  assert.notEqual(user.password, "password-123");
  assert.equal(await user.checkPassword("password-123"), true);
});

after(async () => {
  try {
    await db.sequelize.close();
  } catch (_) {}
});
