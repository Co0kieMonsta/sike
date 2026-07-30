"use client";
import { useAuth } from "@/provider/auth.provider";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

const ProfileInfo = () => {
  const { user, logOut } = useAuth();
  const router = useRouter();

  // DEBUG LOG
  console.log("Current user state in Header:", user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" cursor-pointer">
        <div className=" flex items-center  ">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div title={user?.email || "Sin email"} className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="h-9 w-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-default-800 capitalize ">
              {user?.name ?? user?.email ?? "Usuario"}
            </div>
            <Link
              href=""
              className="text-xs text-default-600 hover:text-primary"
            >
              @admin
            </Link>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {[
            {
              name: "profile",
              icon: "heroicons:user",
              href:""
            },
           
            {
              name: "Settings",
              icon: "heroicons:paper-airplane",
              href:""
            },
            
          ].map((item, index) => (
            <Link
              href={item.href}
              key={`info-menu-${index}`}
              className="cursor-pointer"
            >
              <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                <Icon icon={item.icon} className="w-4 h-4" />
                {item.name}
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          
          

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
              <Icon icon="heroicons:phone" className="w-4 h-4" />
              Support
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[
                  
                  {
                    name: "whatsapp",
                  },
                ].map((item, index) => (
                  <Link href="" key={`message-sub-${index}`}>
                    <DropdownMenuItem className="text-sm font-medium text-default-600 capitalize px-3 py-1.5 dark:hover:bg-background cursor-pointer">
                      {item.name}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mb-0 dark:bg-background" />
        <DropdownMenuItem
          onSelect={async () => {
            await logOut();
            router.push("/");
          }}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ProfileInfo;
