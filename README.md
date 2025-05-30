# Map of Colony Craft

A web-based map viewer designed for the [Colony Craft Minecraft server](https://colonycraft.org). Provides features such as adding and managing markers on the map, viewing coordinates in both Minecraft and map formats, and sharing specific locations with others.

## Demo

Available at [colonycraft.itsbruno.dev](https://colonycraft.itsbruno.dev/).

## Running Locally

### Local setup

```bash
git clone https://github.com/itsbrunodev/colonycraft.git
cd colonycraft
```

### Install dependencies

```bash
pnpm install
```

### Environment setup

Copy the `.env.example` file to `.env.local` and update the values as needed.

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_URL` | The base URL of the application. |
| `NEXT_PUBLIC_TILE_VERSION` | The version of the map tiles, used for caching. (update this whenever you update the tiles) |

### Start development server

```bash
pnpm dev
```

### Run in production mode

```bash
pnpm build
pnpm start
```

## Caching

The map tiles are aggressively cached for performance reasons. If you update the tiles, you will need to update the `NEXT_PUBLIC_TILE_VERSION` environment variable.

## Built With

- [Next.js](https://nextjs.org/)
- [leaflet](https://leafletjs.com/), [react-leaflet](https://react-leaflet.js.org/)
- [tilegen](https://github.com/itsbrunodev/tilegen)

