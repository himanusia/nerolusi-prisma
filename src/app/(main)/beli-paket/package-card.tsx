import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/app/_components/ui/card";
import { Button } from "~/app/_components/ui/button";

interface PackageCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  icon: React.ReactNode;
  disabled: boolean;
  href: string;
  onClick?: () => void;
}

export const PackageCard = ({
  title,
  description,
  price,
  features,
  icon,
  disabled,
  href,
  onClick,
}: PackageCardProps) => {
  return (
    <Card className="h-full border-gray-200 transition-shadow hover:shadow-lg">
      <CardHeader className="pb-4 text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-orange-600">{price}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Fitur:</h4>
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="mt-0.5 text-green-600">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* <Link href={href} target="_blank"> */}
        <Button
          variant="default"
          className="w-full"
          disabled={disabled}
          onClick={onClick}
        >
          Beli Paket
        </Button>
        {/* </Link> */}
      </CardContent>
    </Card>
  );
};