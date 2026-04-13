"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import EngineeringSidebar from "@/components/engineering/EngineeringSidebar";
import { CN_ALL_LESSONS_META } from "@/components/engineering/EngineeringSidebar";

const BREADCRUMB_MAP: Record<string, { level: string; lesson: string }> = {
  "/engineering": { level: "Engineering", lesson: "All Subjects" },
  // CN Level 1
  "/engineering/cn/level1/what-is-network": { level: "CN · Level 1", lesson: "What is a Computer Network?" },
  "/engineering/cn/level1/topologies": { level: "CN · Level 1", lesson: "Network Topologies" },
  "/engineering/cn/level1/osi-model": { level: "CN · Level 1", lesson: "The OSI Model" },
  "/engineering/cn/level1/tcp-ip-model": { level: "CN · Level 1", lesson: "The TCP/IP Model" },
  "/engineering/cn/level1/switching": { level: "CN · Level 1", lesson: "Switching Techniques" },
  // CN Level 2
  "/engineering/cn/level2/physical-layer": { level: "CN · Level 2", lesson: "Physical Layer — Signals" },
  "/engineering/cn/level2/framing-error-detection": { level: "CN · Level 2", lesson: "Framing & Error Detection" },
  "/engineering/cn/level2/arq-protocols": { level: "CN · Level 2", lesson: "ARQ Protocols" },
  "/engineering/cn/level2/mac-protocols": { level: "CN · Level 2", lesson: "Medium Access Control" },
  "/engineering/cn/level2/ethernet-lan": { level: "CN · Level 2", lesson: "Ethernet & LAN Standards" },
  // CN Level 3
  "/engineering/cn/level3/ipv4-addressing": { level: "CN · Level 3", lesson: "IPv4 Addressing" },
  "/engineering/cn/level3/subnetting-cidr": { level: "CN · Level 3", lesson: "Subnetting & CIDR" },
  "/engineering/cn/level3/ip-routing": { level: "CN · Level 3", lesson: "IP Routing & Forwarding" },
  "/engineering/cn/level3/ipv6": { level: "CN · Level 3", lesson: "IPv6 Basics" },
  "/engineering/cn/level3/nat-icmp-arp": { level: "CN · Level 3", lesson: "NAT, ICMP & ARP" },
  // CN Level 4
  "/engineering/cn/level4/tcp-connection": { level: "CN · Level 4", lesson: "TCP — Connection Management" },
  "/engineering/cn/level4/tcp-reliable-transfer": { level: "CN · Level 4", lesson: "TCP — Reliable Data Transfer" },
  "/engineering/cn/level4/tcp-congestion": { level: "CN · Level 4", lesson: "TCP — Congestion Control" },
  "/engineering/cn/level4/udp": { level: "CN · Level 4", lesson: "UDP" },
  "/engineering/cn/level4/ports-multiplexing": { level: "CN · Level 4", lesson: "Port Numbers & Multiplexing" },
  // CN Level 5
  "/engineering/cn/level5/dns": { level: "CN · Level 5", lesson: "DNS" },
  "/engineering/cn/level5/http": { level: "CN · Level 5", lesson: "HTTP" },
  "/engineering/cn/level5/smtp-ftp": { level: "CN · Level 5", lesson: "SMTP, FTP & Email" },
  "/engineering/cn/level5/dhcp": { level: "CN · Level 5", lesson: "DHCP" },
  // CN Level 6
  "/engineering/cn/level6/cryptography": { level: "CN · Level 6", lesson: "Cryptography Basics" },
  "/engineering/cn/level6/tls-ssl": { level: "CN · Level 6", lesson: "TLS/SSL" },
  "/engineering/cn/level6/firewalls-vpn": { level: "CN · Level 6", lesson: "Firewalls & VPN" },
  "/engineering/cn/level6/network-attacks": { level: "CN · Level 6", lesson: "Network Attacks & Defenses" },
  // CN Level 7
  "/engineering/cn/level7/sdn": { level: "CN · Level 7", lesson: "SDN" },
  "/engineering/cn/level7/cdn": { level: "CN · Level 7", lesson: "CDN" },
  "/engineering/cn/level7/cloud-networking": { level: "CN · Level 7", lesson: "Cloud Networking" },
  "/engineering/cn/level7/modern-protocols": { level: "CN · Level 7", lesson: "Modern Protocols" },
};

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const crumb = pathname ? BREADCRUMB_MAP[pathname] : undefined;

  return (
    <div className="flex h-screen" style={{ background: "var(--eng-bg)", fontFamily: "var(--eng-font)" }}>
      <EngineeringSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header
          className="sticky top-0 z-30 backdrop-blur flex items-center gap-3"
          style={{
            background: "rgba(255,255,255,0.9)",
            borderBottom: "1px solid var(--eng-border)",
            padding: "12px 20px",
          }}
        >
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setSidebarOpen(true);
              else setSidebarCollapsed((c) => !c);
            }}
            className="p-1.5 rounded-lg transition-colors"
            style={{
              border: "1px solid var(--eng-border)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Menu className="w-4 h-4" style={{ color: "var(--eng-text-muted)" }} />
          </button>

          {crumb && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--eng-text-muted)" }}>
                {crumb.level}
              </span>
              <span style={{ color: "var(--eng-border)" }}>/</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)" }}>
                {crumb.lesson}
              </span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
