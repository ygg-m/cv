import { career } from "../Data/career";
import { getMonthYear } from "../Helpers/Date";

export const Career = () => {
  interface JobProps {
    Image: string;
    Place: string;
    Role: string;
    From: Date;
    To: string | Date;
    Description: string[];
  }

  const Job = ({ Image, Place, Role, From, To, Description }: JobProps) => {
    const FromDate = getMonthYear(From);
    const ToDate = typeof To === "string" ? To : getMonthYear(To);
    return (
      <div
        className="collapse h-fit outline outline-1 outline-gray-700 hover:outline-primary duration-300 cursor-pointer hover:text-primary"
        tabIndex={0}
      >
        <article className="flex p-4 gap-4">
          <img src={Image} alt={Place} className="w-24 h-24" />
          <div className="grid gap-2">
            <span className="justify-center sm:justify-start flex items-center">
              {Place}
            </span>
            <span className="justify-center sm:justify-start flex items-center text-primary gap-4">
              {Role}
            </span>
            <span className="justify-center sm:justify-start flex items-center opacity-80">
              {FromDate} - {ToDate}
            </span>
          </div>
        </article>
        <div className="collapse-content">
          {Description.map((str) => {
            return <p className="py-1 text-gray-300">{str}</p>;
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="w-screen grid justify-center" id="Career">
      <div className="max-w-7xl w-screen sm:h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] grid items-center">
        <div className="p-8 grid gap-8">
          <h1 className="text-5xl font-thin">Career</h1>
          <div className="grid gap-4">
            {career.map((job) => {
              const { Place, Role, Description, From, To, Image } = job;

              return (
                <Job
                  Image={Image}
                  Place={Place}
                  Role={Role}
                  From={From}
                  To={To}
                  Description={Description}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
