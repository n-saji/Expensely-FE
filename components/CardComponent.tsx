import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
} from "./ui/card";
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
    <Card>
      <CardContent>
        <Label className="text-sm text-muted-foreground mb-2 flex justify-between">
          {title !== "" ? title : "Default Title"}{" "}
          <CardAction>{cardAction ? cardAction : null}</CardAction>
        </Label>

        <p className="text-3xl font-semibold">
          {numberData ? numberData : "0"}
        </p>
      </CardContent>
      <CardFooter>
        <Label className="text-sm text-muted-foreground">{description ? description : ""}</Label>
      </CardFooter>
    </Card>
  );
}
