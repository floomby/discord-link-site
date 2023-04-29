import { signIn } from "next-auth/react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import ProfileDisplay, { type ProfileDisplayProps } from "./ProfileDisplay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

type DiscordSignInProps = {
  linked: boolean;
  profileData: ProfileDisplayProps;
};
const DiscordSignIn: React.FC<DiscordSignInProps> = ({
  linked,
  profileData,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <button
        onClick={() => void signIn("discord")}
        className={
          "w-full rounded-lg px-2 py-2 font-semibold" +
          colorFromFeedbackLevel(FeedbackLevel.Success, true) +
          (linked ? " opacity-80" : "")
        }
      >
        <div className="flex flex-row items-center justify-center">
          {linked ? "Switch Accounts" : "Connect Discord"}
          <FontAwesomeIcon icon={faDiscord} className="ml-2 h-6" />
        </div>
      </button>
      <ProfileDisplay {...profileData} />
    </div>
  );
};

export default DiscordSignIn;
