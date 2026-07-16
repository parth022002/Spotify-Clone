import { Song } from "@/types";

import usePlayer from "./usePlayer";
import useSubscribeModal from "./useSubscribeModal";
import useAuthModal from "./useAuthModal";
import { useUser } from "./useUser";

const useOnPlay = (songs: Song[]) => {
  const player = usePlayer();
  const subscribeModal = useSubscribeModal();
  const authModal = useAuthModal();
  const { subscription, user } = useUser();

  const onPlay = (id: string) => {
    if (!user) {
      return authModal.onOpen();
    }

    // Resume AudioContext inside the user gesture click stack to bypass autoplay policy
    if (typeof window !== "undefined" && (window as any).Howler) {
      const Howler = (window as any).Howler;
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume().catch((e: any) => console.log("AudioContext resume error:", e));
      }
    }

    player.setId(id);
    player.setIds(songs.map((song) => song.id));
  }

  return onPlay;
};

export default useOnPlay;
