# VoxAI Studio

**Professional AI Voice Cloning Made Simple**

Clone any voice with just 3 seconds of audio. Advanced emotion control, multilingual support, and real-time synthesis powered by state-of-the-art neural networks.

Based on [IndexTTS](https://github.com/index-tts/index-tts) by index-tts team.

---

## ⚠️ Important Disclaimer

VoxAI Studio is an AI voice synthesis tool for **educational and creative purposes only**. 

**Before using this software, you MUST:**
- ✅ Read the full [DISCLAIMER.md](DISCLAIMER.md)
- ✅ Obtain consent before cloning voices
- ✅ Use only for legal and ethical purposes
- ✅ Disclose AI-generated content

**Prohibited uses:**
- ❌ Impersonation without consent
- ❌ Fraud, scams, or deception
- ❌ Creating misleading deepfakes
- ❌ Harassment or defamation
- ❌ Any illegal activities

**You are solely responsible for your use of this software.**

---

## 🎯 Features

- 🎤 **Zero-shot Voice Cloning** - Clone any voice from just 3 seconds of audio
- 🎭 **Emotion Control** - Fine-tune emotions with 8-dimensional vector control
- 🌍 **Multilingual Support** - Supports Chinese, English, and mixed languages
- ⚡ **Real-time Synthesis** - GPU-accelerated for fast generation
- 🎨 **Modern UI** - Beautiful Electron-based desktop interface
- 🔒 **Privacy-First** - All processing done locally on your machine
- 📝 **Batch Processing** - Generate multiple audio files efficiently
- 🎛️ **Advanced Controls** - Temperature, top-p, and repetition penalty tuning

---

## 📦 Installation

### System Requirements

- **OS:** Windows 10/11 64-bit
- **Python:** 3.10 or higher
- **GPU:** NVIDIA GPU with 8GB+ VRAM (recommended) or CPU
- **Storage:** At least 10GB free disk space
- **RAM:** 16GB recommended

### Quick Start

1. **Download** the latest release from [Releases](https://github.com/your-username/voxai-studio/releases)
2. **Extract** the archive to any folder
3. **Run** `start_studio.bat`
4. **Wait** for dependencies installation (first time only, may take 5-10 minutes)
5. **Enjoy!**

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/your-username/voxai-studio.git
cd voxai-studio

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies
cd electron
npm install

# Start the application
npm start
```

---

## 🚀 Usage

### Basic Workflow

1. **Upload Voice Reference**
   - Click "Upload Voice" or drag & drop an audio file
   - Minimum 3 seconds recommended
   - Supports WAV, MP3, FLAC formats

2. **Enter Text**
   - Type or paste the text you want to synthesize
   - Supports Chinese, English, and mixed text

3. **Adjust Emotion (Optional)**
   - Choose emotion mode:
     - **From Voice**: Use emotion from voice reference
     - **Reference Audio**: Upload separate emotion reference
     - **Vector Control**: Fine-tune with 8D emotion sliders
     - **Text Description**: Describe emotion in words (experimental)

4. **Generate**
   - Click "Generate Speech"
   - Wait for synthesis (typically 20-60 seconds)
   - Play, export, or regenerate

### Emotion Modes

**Mode 0: From Voice**
- Uses emotion characteristics from the voice reference
- Fastest and most stable
- Recommended for most users

**Mode 1: Reference Audio**
- Upload a separate audio file for emotion reference
- More control over emotional expression
- Requires additional VRAM

**Mode 2: Vector Control**
- 8-dimensional emotion control:
  - Happy, Angry, Sad, Fear, Disgust, Melancholy, Surprise, Calm
- Fine-tune each dimension independently
- Advanced users only

**Mode 3: Text Description** (Experimental)
- Describe emotion in natural language
- Example: "happy and excited with a hint of nervousness"

---

## 🛠️ Configuration

### Model Settings

Edit `api_server.py` to configure:

```python
# Precision mode (FP16 for <8GB VRAM, FP32 for >8GB)
precision_mode = 'fp16'  # or 'fp32'

# Model directory
MODEL_DIR = "./checkpoints"
```

### UI Settings

Edit `electron/src/js/app.js`:

```javascript
const CONFIG = {
    API_HOST: '127.0.0.1',
    API_PORT: 8000,
    MAX_TOKENS: 120,
    TEMPERATURE: 0.8
};
```

---

## 📁 Project Structure

```
voxai-studio/
├── electron/              # Desktop application frontend
│   ├── main.js           # Electron main process
│   ├── preload.js        # Context bridge
│   ├── package.json      # Node dependencies
│   └── src/
│       ├── index.html    # Main UI
│       ├── js/           # JavaScript modules
│       └── css/          # Stylesheets
├── api_server.py         # FastAPI backend server
├── indextts/             # TTS core engine
├── checkpoints/          # AI model weights
├── prompts/              # Voice reference library
├── outputs/              # Generated audio files
├── requirements.txt      # Python dependencies
├── start_studio.bat      # Windows launcher
├── LICENSE               # MIT License
└── DISCLAIMER.md         # Legal disclaimer
```

---

## 🔧 Troubleshooting

### Application won't start

**Problem:** "Python not found" error

**Solution:**
1. Install Python 3.10+ from [python.org](https://www.python.org/)
2. Make sure to check "Add Python to PATH" during installation
3. Restart your computer

---

### UI freezes during generation

**Problem:** Application becomes unresponsive

**Solution:**
1. Disable waveform visualization (see [Performance Guide](docs/PERFORMANCE.md))
2. Use "From Voice" emotion mode (Mode 0)
3. Reduce text length or split into smaller segments

---

### Out of memory errors

**Problem:** "CUDA out of memory" or system crash

**Solution:**
1. Use FP16 precision mode (edit `api_server.py`)
2. Close other applications
3. Use CPU mode (slower but more stable)
4. Upgrade GPU or use cloud services

---

### Slow generation speed

**Problem:** Takes several minutes to generate

**Solution:**
1. Ensure CUDA and cuDNN are installed for GPU acceleration
2. Update NVIDIA drivers
3. Check GPU is being used (not CPU fallback)
4. Use FP16 mode for faster inference

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Setup

```bash
# Install development dependencies
pip install -r requirements-dev.txt
cd electron && npm install --save-dev

# Run in development mode
npm run dev
```

### Code Style

- **Python:** Follow PEP 8, use `black` for formatting
- **JavaScript:** Use ESLint with Airbnb config
- **Commits:** Follow Conventional Commits specification

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- **IndexTTS**: Based on [IndexTTS](https://github.com/index-tts/index-tts)
- **Electron**: [MIT License](https://github.com/electron/electron/blob/main/LICENSE)
- **PyTorch**: [BSD License](https://github.com/pytorch/pytorch/blob/master/LICENSE)
- **Transformers**: [Apache 2.0](https://github.com/huggingface/transformers/blob/main/LICENSE)

---

## 🚨 Reporting Misuse

If you become aware of misuse of this software, please report it.

We take misuse seriously and will take appropriate action.

---

## ⚖️ Ethical AI Use

We are committed to responsible AI development and use:

- ✅ **Consent Required**: Explicit permission needed for voice cloning
- ✅ **Attribution Required**: Disclose AI-generated content
- ✅ **Prohibited Uses**: No fraud, impersonation, or harmful content
- ✅ **Transparency**: Promote ethical use of AI technology

---

## 🙏 Acknowledgments

- [IndexTTS](https://github.com/index-tts/index-tts) - Original TTS engine and model
- [index-tts team](https://github.com/index-tts) - Core technology developers
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [PyTorch](https://pytorch.org/) - Deep learning framework
- [Transformers](https://huggingface.co/transformers/) - NLP library
- [FastAPI](https://fastapi.tiangolo.com/) - Backend API framework

---


## 📊 Project Status

![GitHub release](https://img.shields.io/github/v/release/your-username/voxai-studio)
![GitHub license](https://img.shields.io/github/license/your-username/voxai-studio)
![GitHub stars](https://img.shields.io/github/stars/your-username/voxai-studio)
![GitHub issues](https://img.shields.io/github/issues/your-username/voxai-studio)

---


## 💖 Support This Project

If you find VoxAI Studio useful, please consider:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report bugs** and suggest features
- 📝 **Contribute** code or documentation
- 💬 **Share** with others who might benefit

---

## 📄 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [User Manual](docs/USER_MANUAL.md)
- [API Documentation](docs/API.md)
- [Performance Optimization](docs/PERFORMANCE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [FAQ](docs/FAQ.md)

---

## ⚠️ Final Reminder

**USE THIS SOFTWARE RESPONSIBLY AND ETHICALLY.**

This is a powerful tool that can be used for both good and harm. Please:
- Always obtain consent before cloning someone's voice
- Clearly disclose AI-generated content
- Respect copyright and voice rights
- Use for legal purposes only

**You are solely responsible for how you use this software.**

