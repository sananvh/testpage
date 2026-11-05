import { ldJson } from "@/lib/schema";

/** Renders one or more schema.org JSON-LD blocks. */
export default function JsonLd({ data }: { data: unknown | unknown[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(d) }} />
      ))}
    </>
  );
}
