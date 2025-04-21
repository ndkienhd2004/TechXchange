import "./BrandLogos.css";
import FujiLogo from "../../assets/Images/FujiLogo.png";
import AppleLogo from "../../assets/Images/AppleLogo.png";
import NikonLogo from "../../assets/Images/NikonLogo.png";
import HPLogo from "../../assets/Images/HpLogo.png";
import LGLogo from "../../assets/Images/LGLogo.png";
import ASUSLogo from "../../assets/Images/AsusLogo.png";
import AMDLogo from "../../assets/Images/AmdLogo.png";
import NVIDIALogo from "../../assets/Images/NvidiaLogo.png";
import DellLogo from "../../assets/Images/DellLogo.png";
import IntelLogo from "../../assets/Images/IntelLogo.png";
const BrandLogos = () => {
  const Logos = [
    { name: "Fuji", logo: FujiLogo },
    { name: "Apple", logo: AppleLogo },
    { name: "Nikon", logo: NikonLogo },
    { name: "HP", logo: HPLogo },
    { name: "ASUS", logo: ASUSLogo },
    { name: "LG", logo: LGLogo },
    { name: "AMD", logo: AMDLogo },
    { name: "NVDIA", logo: NVIDIALogo },
    { name: "DELL", logo: DellLogo },
    { name: "Intel", logo: IntelLogo },
  ];
  return (
    <div className="brand-logos">
      {Logos.map((brand) => (
        <div key={brand.name} className="brand-logo">
          <img src={brand.logo} alt={brand.name} />
        </div>
      ))}
    </div>
  );
};
export default BrandLogos;
