import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  return (
    <div
      onClick={() => {
        router.push("/");
      }}
    >
      <img src="/images/logo.png" alt="logo" width={50} height={50} />
    </div>
  );
}
