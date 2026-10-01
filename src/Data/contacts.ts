import { ReactComponent as GitHubIcon } from "../Assets/UI/github.svg";
import { ReactComponent as InstagramIcon } from "../Assets/UI/instagram.svg";
import { ReactComponent as LinkedinIcon } from "../Assets/UI/linkedin.svg";
import { ReactComponent as MailIcon } from "../Assets/UI/mail.svg";
import { ReactComponent as PhoneIcon } from "../Assets/UI/phone.svg";
import { ReactComponent as TiktokIcon } from "../Assets/UI/tiktok.svg";
import { ReactComponent as TwitterIcon } from "../Assets/UI/twitter.svg";

export const contacts = {
  Resume: {
    Link: "https://drive.google.com/file/d/1Xzh1LSBM64ZnpV27amtfwdE3Ylkr3w-9/view?usp=share_link",
  },
  Contact: {
    Email: {
      Name: "Email",
      Link: "ygorgm95@gmail.com",
      Icon: MailIcon,
    },
    Phone: {
      Name: "+55 9 5283 1030",
      Link: "https://api.whatsapp.com/send?phone=5511952831030",
      Icon: PhoneIcon,
    },
    GitHub: {
      Name: "Github",
      Use: "ygg-m",
      Link: "https://github.com/ygg-m",
      Icon: GitHubIcon,
    },
  },
  Social: [
    {
      Name: "Linkedin",
      User: "ygorgm",
      Link: "https://www.linkedin.com/in/ygorgm/",
      Icon: LinkedinIcon,
    },
    {
      Name: "Instagram",
      User: "ygglart",
      Link: "https://www.instagram.com/ygglart/",
      Icon: InstagramIcon,
    },
    // {
    //   Name: "Tiktok",
    //   User: "ygg.js",
    //   Link: "https://www.tiktok.com/@ygg.js",
    //   Icon: TiktokIcon,
    // },
    // {
    //   Name: "Twitter",
    //   User: "ygg.js",
    //   Link: "https://twitter.com/yggjs",
    //   Icon: TwitterIcon,
    // },
  ],
};
