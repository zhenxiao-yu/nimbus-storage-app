import { cn, formatDateTime } from "@/lib/utils";

export const FormattedDateTime = ({
  date,
  className,
}: {
  date: string | null | undefined;
  className?: string;
}) => {
  return (
    <time
      dateTime={date ?? undefined}
      className={cn("text-xs text-muted-foreground", className)}
    >
      {formatDateTime(date)}
    </time>
  );
};

export default FormattedDateTime;
