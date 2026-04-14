"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Globe, Link2, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWorkshops = async () => {
      setLoading(true);
      setError("");

      try {
        const groupsReq = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups/get-groups`);
        const groupsRes = await groupsReq.json();

        if (groupsRes.type !== "success") {
          throw new Error(groupsRes.message || "Failed to load groups.");
        }

        const publicGroups = (groupsRes.groups || []).filter(
          (group) => String(group.visibility || "").toLowerCase() === "public"
        );

        const token = localStorage.getItem("token");
        const postRequests = publicGroups.map(async (group) => {
          const postsReq = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/get-group-posts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ groupId: group._id }),
          });

          const postsRes = await postsReq.json();
          if (postsRes.type !== "success") {
            return [];
          }

          return (postsRes.posts || [])
            .filter((post) => Boolean(post.eventId))
            .map((post) => ({
              ...post,
              groupName: group.name,
              groupIcon: group.icon,
              groupId: group._id,
            }));
        });

        const postsByGroup = await Promise.all(postRequests);
        const merged = postsByGroup
          .flat()
          .sort(
            (a, b) =>
              new Date(a.eventId?.startAt || a.createdAt).getTime() -
              new Date(b.eventId?.startAt || b.createdAt).getTime()
          );

        setWorkshops(merged);
      } catch (fetchError) {
        setError(fetchError.message || "Could not load workshops right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return workshops.filter((post) => new Date(post.eventId?.startAt).getTime() >= now).length;
  }, [workshops]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/60 p-6 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Community Workshops</h1>
          <p className="text-muted-foreground">
            Explore workshop posts from public groups that include scheduled events.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {workshops.length} total
            </Badge>
            <Badge variant="secondary" className="inline-flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {upcomingCount} upcoming
            </Badge>
          </div>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Loading workshops...
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-red-500">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && workshops.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No workshop posts found in public groups yet.
            </CardContent>
          </Card>
        )}

        {!loading && !error && workshops.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {workshops.map((post) => {
              const event = post.eventId;

              return (
                <Card key={post._id} className="h-full border-border/80">
                  <CardHeader className="space-y-2">
                    <CardTitle className="line-clamp-2 text-lg">{event?.title || "Workshop"}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event?.startAt || post.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{post.groupIcon || "🌐"}</span>
                      <span className="font-medium">{post.groupName}</span>
                    </div>

                    {event?.description && (
                      <p className="line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
                    )}

                    {post.content && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {event?.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Globe className="h-3.5 w-3.5" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {event?.location || "In person"}
                        </span>
                      )}

                      {Array.isArray(event?.hosts) && event.hosts.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {event.hosts.join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Link href={`/community/groups/${post.groupId}`}>
                        <Button variant="outline" size="sm">
                          Open Group
                        </Button>
                      </Link>

                      {event?.meetUrl && (
                        <a href={event.meetUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="inline-flex items-center gap-1">
                            <Link2 className="h-3.5 w-3.5" />
                            Join Room
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

