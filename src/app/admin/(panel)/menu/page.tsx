import { getDictionary } from "@/i18n/get-dictionary";
import { MENU_PAGES } from "@/lib/menu";
import { getMenu } from "@/lib/site";
import MenuEditor from "@/components/admin/MenuEditor";
import { saveMenu } from "../../actions";

export default async function MenuAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { saved, error } = await searchParams;
  const t = getDictionary("az").nav;
  const pages = MENU_PAGES.map((p) => ({ key: p.key, label: t[p.nav], path: p.path }));
  return (
    <>
      <div className="head">
        <div>
          <h1>Yuxarı menyu</h1>
          <p>Saytın yuxarısındakı menyuda hansı səhifələrin hansı sıra ilə görünəcəyini seçin. Seçilməyənlər “Menyu” düyməsi ilə açılan böyük menyuda qalır. Adlar: Saytın mətnləri → Menyu və ümumi yazılar.</p>
        </div>
      </div>
      {saved && <p className="alert alert-ok">Yadda saxlanıldı.</p>}
      {error && <p className="alert alert-error">{error}</p>}
      <MenuEditor key={saved ?? "0"} pages={pages} selected={getMenu()} action={saveMenu} />
    </>
  );
}
