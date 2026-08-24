# Homelab Infrastructure & Automation

## Overview
Proxmox VE stanowi główny hiperwizor w mojej infrastrukturze. Kontenery LXC oraz maszyny wirtualne są zarządzane lokalnie. 
Sieć opiera się o routing w OpenWrt oraz filtrowanie zapytań DNS przez Pi-hole na urządzeniach Raspberry Pi.

## Target Architecture
- Automatyzacja deploymentu kontenerów Docker.
- Integracja bazy Supabase do logowania stanu i metryk.
- Wykorzystanie modeli AI do analityki logów sieciowych i systemowych.