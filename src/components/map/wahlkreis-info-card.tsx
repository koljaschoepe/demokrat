'use client';

import { Users, Vote, User, GripHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WahlkreisInfoCard() {
  return (
    <div className="absolute inset-x-4 bottom-16 z-10">
      <Card>
        {/* Drag handle indicator */}
        <div className="flex justify-center pt-2">
          <GripHorizontal className="size-5 text-muted-foreground/40" />
        </div>

        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Berlin-Mitte (WK 75)</CardTitle>
            <Badge variant="secondary">Dein Wahlkreis</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-4" />
              42 aktive Bürger
            </span>
            <span className="flex items-center gap-1.5">
              <Vote className="size-4" />
              156 Abstimmungen
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Dein Abgeordneter</p>
              <p className="font-medium">Max Müller (SPD)</p>
            </div>
          </div>

          <Button variant="outline" size="sm" className="w-full">
            Details
            <ChevronRight className="size-3.5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
