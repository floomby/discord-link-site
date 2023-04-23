import { signIn } from "next-auth/react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

type LinkAccountProps = {
  id: string;
  name: string;
};
const LinkAccount: React.FC<LinkAccountProps> = ({ id, name }) => {
  return (
    <button
      onClick={() => void signIn(id)}
      key={name}
      className={
        "w-full rounded-lg px-2 py-2 font-semibold" +
        colorFromFeedbackLevel(FeedbackLevel.Secondary, true)
      }
    >
      Link {name}
    </button>
  );
};

export default LinkAccount;
