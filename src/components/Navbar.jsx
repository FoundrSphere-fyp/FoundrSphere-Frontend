"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useUserStore } from "@/store/store"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const menuItems = [
  { title: "Home", href: "/" },
  { 
    title: "Community", 
    href: "/community",
    submenu: [
      { 
        title: "Groups", 
        href: "/community/groups",
        description: "Join communities of like-minded founders"
      },
      { 
        title: "Discussions", 
        href: "/community/discussions",
        description: "Engage in meaningful conversations"
      },
      { 
        title: "Workshops", 
        href: "/community/workshops",
        description: "Learn from industry experts"
      },
    ]
  },
  { title: "Founders", href: "/founders" },
  { title: "Investors", href: "/investors" },
  { title: "About", href: "/about" },
]

export function Navbar() {

  const router = useRouter();

  
  
  const {isLoggedIn, userId, SetIsLoggedIn, SetUsername, username, SetUserId} = useUserStore();

  const verifyToken = async() => {
    let token = localStorage.getItem("token");
    if (!token) {
      SetIsLoggedIn(false);
      return;
    }
    const req = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    const res = await req.json();
    if (res.type === "success") {
      SetIsLoggedIn(true);
      SetUsername(res.user.username)
      SetUserId(res.user._id)
    } else {
      SetIsLoggedIn(false);
    }
  }

  const logout = () => {
    SetIsLoggedIn(false);
    SetUsername("");
    localStorage.removeItem("token");
    toast.success("Logged out Successfully")
    router.push("/login")

  }

  React.useEffect(() => {
    verifyToken();
  }, []);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <span className="font-bold text-xl">FoundrSphere</span>
        </Link>

        {/* Desktop Menu - Center */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.submenu ? (
                    <>
                      <NavigationMenuTrigger className="text-sm font-medium h-9">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.submenu.map((subItem) => (
                            <li key={subItem.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subItem.href}
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                >
                                  <div className="text-sm font-medium leading-none mb-2">
                                    {subItem.title}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {subItem.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm font-medium transition-colors hover:text-primary px-4 py-2 inline-flex items-center justify-center rounded-md h-9"
                    >
                      {item.title}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Side - Auth */}
        <div className="flex items-center space-x-4 ml-auto">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback>{username.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Welcome, {username}</DropdownMenuLabel>
                <DropdownMenuLabel>{userId}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-4">
                {menuItems.map((item) => (
                  <div key={item.href}>
                    {item.submenu ? (
                      <>
                        <div className="text-sm font-semibold mb-3">{item.title}</div>
                        <div className="pl-2 flex flex-col space-y-3">
                          {item.submenu.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block space-y-1 rounded-md p-2 hover:bg-accent transition-colors"
                            >
                              <div className="text-sm font-medium">{subItem.title}</div>
                              <p className="text-xs text-muted-foreground leading-snug">
                                {subItem.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-sm font-medium transition-colors hover:text-primary"
                      >
                        {item.title}
                      </Link>
                    )}
                  </div>
                ))}
                {!isLoggedIn && (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register">Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}