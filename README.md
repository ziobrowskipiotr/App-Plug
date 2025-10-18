# App-Plug
Mobile app for smart-plug managing

# Schema

```mermaid
graph TD
    subgraph "VPN (Tailscale)"
        A[Mobile app]
    end
    B["<table style='border-collapse: separate; border-spacing: 0; background-color:#000000;'>
        <tr style='background-color:#4a90e2; color:white;'>
            <th>Action</th>
            <th>Command</th>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>turn on</td>
            <td style='border:1px solid white;'>spc on [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>turn off</td>
            <td style='border:1px solid white;'>spc off [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>add device</td>
            <td style='border:1px solid white;'>spc add [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>remove device</td>
            <td style='border:1px solid white;'>spc remove [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get state</td>
            <td style='border:1px solid white;'>spc state [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get active power</td>
            <td style='border:1px solid white;'>spc active-power [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get voltage</td>
            <td style='border:1px solid white;'>spc get-voltage [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get current</td>
            <td style='border:1px solid white;'>spc get-current [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get energy today</td>
            <td style='border:1px solid white;'>spc energy-today [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get energy yesterday</td>
            <td style='border:1px solid white;'>spc energy-yesterday [smartplug name]</td>
        </tr>
        <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>get energy [from] [to]</td>
            <td style='border:1px solid white;'>spc-energy --name [smartplug name] --from [date] --to [date]</td>
        </tr>
         <tr style='background-color:#000000;'>
            <td style='border:1px solid white;'>rename device</td>
            <td style='border:1px solid white;'>spc rename [smartplug name]</td>
        </tr>
    </table>"]
    subgraph "Wi-Fi"
    subgraph "VPN (Tailscale)"
        subgraph "Raspberry PI Zero"
        C@{ shape: lin-cyl, label: "App Server" }
        D@{ shape: lin-cyl, label: "Database" }
        E@{ shape: lin-cyl, label: "MCP Server" }
    end
    end
        F@{ shape: circle, label: "Smartplug" }
    end

    A -- "Text action choosing" --> B
    A -- "Voice action choosing" --> E
    B -- "Request" --> C
    E -- "Text action choosing" --> B
    C -- "Database request" --> D
    D -- "Database Answer" --> C
    D -- "(If required)
    Curl request" --> F
    F -- "(If required)
    Curl request" --> D
    C -- "Answer" --> A
```
