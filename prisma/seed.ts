import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

const prisma = new PrismaClient();

async function seed() {
  const firstName = "Aydrian";
  const lastName = "Howard";
  const email = "aydrian@gmail.com";
  const passwordHash = await bcrypt.hash("password1234", 10);

  const user = await prisma.user.create({
    data: {
      email,
      firstName,
      guestProfile: {
        create: {
          avatarUrl:
            "https://pbs.twimg.com/profile_images/1637838912243617793/XmhcZyZy_400x400.jpg",
          company: "Tabnine",
          firstName,
          lastName,
          title: "Principal Product Evangelist",
          twitter: "itsaydrian"
        }
      },
      lastName,
      passwordHash
    },
    select: { guestProfile: { select: { id: true } }, id: true }
  });

  const guestId = user.guestProfile?.id;
  invariant(typeof guestId === "string", "guestId should not be null");

  const startDate = new Date();
  startDate.setHours(15, 0, 0, 0);
  const endDate = new Date();
  startDate.setHours(17, 0, 0, 0);

  await prisma.show.create({
    data: {
      description: "A weekly live coding Twitch stream",
      episodes: {
        create: {
          description: "An episode for local testing",
          endDate,
          guests: {
            create: {
              guestId,
              order: 0
            }
          },
          startDate,
          title: "Test Episode",
          vdoPassword: "password1234"
        }
      },
      sceneCollection: "ME",
      title: "Corgis && Code"
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

seed();
