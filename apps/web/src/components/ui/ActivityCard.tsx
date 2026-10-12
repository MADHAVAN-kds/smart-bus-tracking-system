import { Clock } from "lucide-react";

type Props = {
  title: string;
  time: string;
};

export default function ActivityCard({
  title,
  time,
}: Props) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">

      <div className="flex items-center gap-3">

        <div className="w-3 h-3 rounded-full bg-green-500"></div>

        <span className="text-slate-700">
          {title}
        </span>

      </div>

      <div className="flex items-center gap-2 text-slate-400 text-sm">

        <Clock size={15} />

        {time}

      </div>

    </div>
  );
}