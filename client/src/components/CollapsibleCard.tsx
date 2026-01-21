import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleCardProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  headerActions?: ReactNode;
  className?: string;
}

export function CollapsibleCard({ 
  title, 
  children, 
  defaultOpen = true, 
  headerActions,
  className = ""
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        {headerActions && (
          <div onClick={(e) => e.stopPropagation()}>
            {headerActions}
          </div>
        )}
      </CardHeader>
      {isOpen && (
        <CardContent>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
