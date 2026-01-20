import { getLogoutFlow, getServerSession } from "@ory/nextjs/app";
import { HeaderClient } from "./header-client";

interface HeaderProps {
  currentView?: "dashboard" | "activity" | "routes";
}

export async function Header({ currentView }: HeaderProps) {
  const session = await getServerSession();
  const logoutFlow = session ? await getLogoutFlow() : null;

  // Ory Kratosのログアウトフローからログアウト用のURLを取得
  const logoutUrl = logoutFlow?.logout_url;

  return (
    <HeaderClient
      currentView={currentView}
      isAuthenticated={!!session}
      logoutUrl={logoutUrl}
    />
  );
}
