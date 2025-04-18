import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push("/");
      }}
    >
      <Image src="/images/logo.png" alt="logo" width={50} height={50} />
    </div>
  );
}
