import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { prisma } from "~/utils/db.server";
import { formatDateRange } from "~/utils/misc";

export const loader = async () => {
  const episodes = await prisma.episode.findMany({
    where: { show: { sceneCollection: "CRL" } },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true
    },
    orderBy: { startDate: "desc" }
  });

  return typedjson({ episodes });
};

export default function CrlPromos() {
  const { episodes } = useTypedLoaderData<typeof loader>();

  return (
    <div className="container">
      <h2 className="text-3xl font-bold tracking-tight">Promo Images</h2>
      <table className="w-full">
        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700">
          <th className="px-6 py-3">Date</th>
          <th className="px-6 py-3">Episode Title</th>
        </thead>
        <tbody>
          {episodes.map((episode) => (
            <tr
              key={episode.id}
              className="border-b bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <td className="px-6 py-4">
                {formatDateRange(episode.startDate, episode.endDate)}
              </td>
              <td className="px-6 py-4">
                {/* <a
                  className="font-medium text-crl-dark-blue hover:underline"
                  href={`/resources/promos/${episode.id}.png`}
                >
                  {episode.title}
                </a> */}
                <Link
                  className="font-medium text-crl-dark-blue hover:underline"
                  to={`./${episode.id}`}
                  relative="path"
                >
                  {episode.title}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
