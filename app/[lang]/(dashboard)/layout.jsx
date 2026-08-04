import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { DevWarningPopup } from "@/components/DevWarningPopup";
import { getDictionary } from "@/app/dictionaries";
const layout = async ({ children, params }) => {
  const { lang } = await params;

  const trans = await getDictionary(lang);

  return (
    <DashBoardLayoutProvider trans={trans}>
      {children}
      <DevWarningPopup />
    </DashBoardLayoutProvider>
  );
};

export default layout;
