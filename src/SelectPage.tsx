// src/App.tsx

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { useEffect, useState } from "react";
import Game from "./Game";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type Collection = { name: string; contents: string[] };
const defaultSources = Array.from({ length: 11 }, (_, i) => i + 1).map(
  (x) => `/sources/tst/${x.toString().padStart(2, "0")}.mp4`
);

const SelectPage: React.FC<{ params: Record<string, string> }> = ({
  params,
}) => {
  const [sources, setSources] = useState(defaultSources);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const s3Client = new S3Client({
    region: "us-west-1",
    credentials: {
      accessKeyId: params.key,
      secretAccessKey: params.secret,
    },
  });

  useEffect(() => {
    const initializeS3 = async () => {
      const response = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: params.bucket,
          Prefix: params.prefix,
        })
      );

      const files = response
        .Contents!.map((x) => x.Key!.slice(params.prefix.length + 1))
        .filter((x) => x.endsWith(".mp4"));

      const tmpCollections: Collection[] = [];

      for (const file of files) {
        const parts = file.split("/");
        const page = parts.shift()!;
        const name = parts.join("/");

        if (tmpCollections.find((x) => x.name === page)) {
          tmpCollections.find((x) => x.name === page)!.contents.push(name);
        } else {
          tmpCollections.push({ name: page, contents: [name] });
        }
      }

      setCollections(tmpCollections);

      const currPath = window.location.pathname.slice(1);
      const currCollection =
        currPath && tmpCollections.find((x) => x.name === currPath);
      if (currCollection) {
        chooseCollection(currCollection);
      }
    };

    if (params.bucket && params.prefix && params.key && params.secret) {
      initializeS3();
    }
  }, [params.bucket, params.prefix, params.key, params.secret]);

  const chooseCollection = async (collection: Collection) => {
    setActiveCollection(collection.name);

    // Create presigned URLs for 11 videos in the collection
    const videos = collection.contents.sort().slice(0, 11)!;
    const promises: Promise<string>[] = [];
    for (const video of videos) {
      const command = new GetObjectCommand({
        Bucket: params.bucket,
        Key: `${params.prefix}/${collection.name}/${video}`,
      });
      promises.push(
        getSignedUrl(s3Client, command, {
          expiresIn: 60 * 60 * 2,
        })
      );
    }
    setSources(await Promise.all(promises));
  };

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    if (event.target.value === "empty!") {
      setSources(defaultSources);
      window.history.pushState({}, "", "/");
      return;
    }

    const collectionName = event.target.value;
    const collection = collections.find((x) => x.name === collectionName);

    if (collection) {
      window.history.pushState({}, "", `/${collectionName}`);
      chooseCollection(collection);
    }
  };

  return (
    <main>
      <select
        onChange={onSelect}
        value={activeCollection || "empty!"}
        className="page-selector"
      >
        <option value="empty!">-</option>
        {collections.map((collection) => (
          <option key={collection.name} value={collection.name}>
            {collection.name}
          </option>
        ))}
      </select>
      <Game sources={sources} />
    </main>
  );
};

export default SelectPage;
