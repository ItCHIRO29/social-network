import Image from "next/image";
import Link from "next/link";

export default function Logo() {
    return (
        <Link href="/">
            <Image  src="/images/logo.png" alt="logo" width={50} height={50} />
        </Link>  
    );
}