import assert from "node:assert/strict";
import test from "node:test";
import {
  hasPassportStorageCapacity,
  passportSchemaUpgradePlan,
  passportStorageRepairPlan,
} from "../src/app/achievement/passport-storage";

test("schema upgrades create all stores for a fresh browser", () => {
  assert.deepEqual(passportSchemaUpgradePlan(0), {
    createCoreStores: true,
    createMetadataStore: true,
  });
});

test("schema v1 migrates to v2 without recreating core stores", () => {
  assert.deepEqual(passportSchemaUpgradePlan(1), {
    createCoreStores: false,
    createMetadataStore: true,
  });
  assert.deepEqual(passportSchemaUpgradePlan(2), {
    createCoreStores: false,
    createMetadataStore: false,
  });
});

test("repair plan removes orphan photos and reconciles photo flags", () => {
  const plan = passportStorageRepairPlan(
    [
      { id: "stamp-with-photo", hasPhoto: false },
      { id: "stamp-without-photo", hasPhoto: true },
      { id: "stamp-consistent", hasPhoto: true },
    ],
    [
      { stampId: "stamp-with-photo" },
      { stampId: "stamp-consistent" },
      { stampId: "orphan-photo" },
    ],
  );

  assert.deepEqual(plan.orphanPhotoIds, ["orphan-photo"]);
  assert.deepEqual(plan.stampPhotoFlags, [
    { id: "stamp-with-photo", hasPhoto: true },
    { id: "stamp-without-photo", hasPhoto: false },
  ]);
});

test("storage capacity reserves a safety buffer", () => {
  assert.equal(hasPassportStorageCapacity({ usage: undefined, quota: undefined }, 2_000_000), true);
  assert.equal(hasPassportStorageCapacity({ usage: 1_000_000, quota: 5_000_000 }, 1_000_000), true);
  assert.equal(hasPassportStorageCapacity({ usage: 4_500_000, quota: 5_000_000 }, 100_000), false);
});
