/* eslint-disable no-console */

import prisma from "../src/client";
import { encryptPassword } from "../src/utils/encryption";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "victorlc2019prisma.io" },
    update: {},
    create: {
      email: "victorlc2019prisma.io",
      password: await encryptPassword("senha123"),
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();
    process.exit(1);
  });
