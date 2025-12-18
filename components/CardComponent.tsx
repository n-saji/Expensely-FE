import { Card, CardContent, CardFooter } from "./ui/card";
import { Label } from "./ui/label";

export default function CardComponent({
  title,
  cardAction,
  numberData,
  description,
}: {
  title: string;
  cardAction?: React.ReactNode;
  numberData?: string;
  description?: string;
}) {
  return (
    <Card className="flex h-full flex-col min-w-0">
      <CardContent className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <Label className="text-sm text-muted-foreground truncate">
            {title || "Default Title"}
          </Label>

          {cardAction && <div className="flex-shrink-0">{cardAction}</div>}
        </div>

        {/* Main number */}
        <p className="text-2xl md:text-3xl font-semibold truncate">
          {numberData || "0"}
        </p>
      </CardContent>

      {/* Footer */}
      {description && (
        <CardFooter className="mt-auto pt-0 md:min-h-[36px] flex items-start">
          <p className="text-sm text-muted-foreground line-clamp-2 p-0">
            {description}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
