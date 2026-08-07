import ClientCategoryList from "./components/client-category-list";

export const metadata = {
  title: "Categorías de Inventario",
};

export default function CategoriesPage() {
  return (
    <div>
      <ClientCategoryList />
    </div>
  );
}
