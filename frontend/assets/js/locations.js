// Add more towns here. Check lat/lon on Google Maps (right-click > coordinates).
const LOCATIONS = [
  { slug:"dadu",           name:"Dadu",               lat:26.7319, lon:67.7750, featured:true },
  { slug:"johi",           name:"Johi",               lat:26.6919, lon:67.6122, featured:true },
  { slug:"mehar",          name:"Mehar",              lat:27.1833, lon:67.8167, featured:true },
  { slug:"bhan-syedabad",  name:"Bhan Syedabad",      lat:26.5628, lon:67.7183, featured:true },
  { slug:"wahi-pandhi",    name:"Wahi Pandhi",        lat:26.5333, lon:67.6500, featured:true },
  { slug:"khairpur-nathan-shah", name:"Khairpur Nathan Shah", lat:27.0947, lon:67.7336, featured:true },
  { slug:"moro",           name:"Moro",               lat:26.6628, lon:68.0003 },
  { slug:"sehwan-sharif",  name:"Sehwan Sharif",      lat:26.4167, lon:67.8667 },
  { slug:"larkana",        name:"Larkana",            lat:27.5600, lon:68.2264 },
  { slug:"jamshoro",       name:"Jamshoro",           lat:25.4292, lon:68.2800 },
].map(l => ({ ...l, image:`assets/images/${l.slug}.jpg`, place:`${l.name}, Sindh, Pakistan` }));

const getLocationBySlug = s => LOCATIONS.find(l => l.slug === s) || LOCATIONS[0];
const getFeaturedLocations = () => LOCATIONS.filter(l => l.featured);
const searchLocations = q => {
  q = q.trim().toLowerCase();
  return q ? LOCATIONS.filter(l => l.name.toLowerCase().includes(q)) : [];
};
