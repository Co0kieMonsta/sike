import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QuoteClient } from "./components/quote-client";
import { notFound } from "next/navigation";

export default async function PublicQuotePage({ params }) {
  const { id } = await params;
  
  const docRef = doc(db, "docs_cotizaciones", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const quote = { id: docSnap.id, ...docSnap.data() };

  return (
    <div className="min-h-screen bg-default-100 py-12">
      <QuoteClient quote={quote} />
    </div>
  );
}
