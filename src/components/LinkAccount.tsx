import { getCsrfToken, signIn } from "next-auth/react";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";

type LinkAccountProps = {
  id: string;
  name: string;
  linked: boolean;
};
const LinkAccount: React.FC<LinkAccountProps> = ({ id, name, linked }) => {
  return (
    <button
      onClick={async () =>
        void signIn(id, undefined, { csrfToken: (await getCsrfToken()) || "" })
      }
      key={name}
      className={
        "w-full rounded-lg px-2 py-2 font-semibold" +
        colorFromFeedbackLevel(FeedbackLevel.Secondary, true) + 
        (linked ? " opacity-50 cursor-not-allowed" : "")
      }
    >
      Link {name}
    </button>
  );
};

export default LinkAccount;
