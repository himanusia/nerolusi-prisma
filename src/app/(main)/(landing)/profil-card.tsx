import { Avatar, AvatarImage, AvatarFallback } from "~/app/_components/ui/avatar";
interface ProfilCardProps {
  user: {
    image: string;
    name: string;
  };
}

export default function ProfilCard({ user }: ProfilCardProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="flex size-12 items-center justify-center">
        <AvatarImage src={user.image} />
        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <h2 className="md:text-lg">{user.name}</h2>
    </div>
  );
}
