// ===== KEY ACCESS (FIREBASE FIRESTORE) =====
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

        // TODO: Substitua pelas mesmas credenciais do Firebase usadas no gerador
        const firebaseConfig={
apiKey:"AIzaSyASZW0rPGb_-xnsWjlFkV0-d3UH6MNVzYo",
authDomain:"keys-gerador.firebaseapp.com",
projectId:"keys-gerador",
storageBucket:"keys-gerador.firebasestorage.app",
messagingSenderId:"181530577721",
appId:"1:181530577721:web:0bb38f186b5241c776f6e8",
measurementId:"G-S0558S0WPZ"
};


        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const KEY_UNLOCKED = 'mestrexit_key_unlocked';
        const ACTIVE_KEY = 'mestrexit_active_key';
        const keyPage = document.getElementById('keyPage');
        const accessKeyInput = document.getElementById('accessKey');
        const enterKeyBtn = document.getElementById('enterKeyBtn');
        const pasteKeyBtn = document.getElementById('pasteKeyBtn');
        const keyStatus = document.getElementById('keyStatus');
        const rememberKey = document.getElementById('rememberKey');
        const REMEMBERED_KEY = 'mestrexit_remembered_key';
        const mainHeader = document.getElementById('mainHeader');
        const siteFooter = document.getElementById('siteFooter');
        const siteWatermark = document.getElementById('siteWatermark');

        let activeKeyData = null;

        function unlockSite(key, data) {
            localStorage.setItem(KEY_UNLOCKED, '1');
            localStorage.setItem(ACTIVE_KEY, key);
            activeKeyData = { key, ...data };
            
            keyPage.classList.remove('active');
            document.getElementById('homePage').classList.add('active');
            mainHeader.style.display = '';
            siteFooter.style.display = '';
            siteWatermark.style.display = '';
            window.scrollTo({top:0, behavior:'smooth'});
        }

        let statusTimer = null;
        let fpsFrameCount = 0, fpsLastTime = performance.now(), detectedFps = 0;

        function detectDeviceInfo() {
            const ua = navigator.userAgent || '';
            let brand = 'Desconhecida';
            if (/Samsung|SM-/i.test(ua)) brand = 'Samsung';
            else if (/Xiaomi|Redmi|Mi |POCO/i.test(ua)) brand = /Redmi/i.test(ua) ? 'Redmi' : /POCO/i.test(ua) ? 'POCO' : 'Xiaomi';
            else if (/Motorola|Moto /i.test(ua)) brand = 'Motorola';
            else if (/Infinix/i.test(ua)) brand = 'Infinix';
            else if (/TECNO/i.test(ua)) brand = 'TECNO';
            else if (/Huawei|HUAWEI/i.test(ua)) brand = 'Huawei';
            else if (/OPPO/i.test(ua)) brand = 'OPPO';
            else if (/vivo/i.test(ua)) brand = 'vivo';
            else if (/iPhone|iPad/i.test(ua)) brand = 'Apple';

            const androidMatch = ua.match(/Android\s([0-9.]+)/i);
            const modelMatch = ua.match(/Android[^;)]*;\s*(?:[^;]+;\s*)?([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i);
            const model = modelMatch ? modelMatch[1].trim() : (ua.match(/;\s*([^;)]+?)\s+Build\//i)?.[1]?.trim() || 'Não identificado pelo navegador');
            const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB (estimada)` : 'Não disponível';

            document.getElementById('stBrand').textContent = brand;
            document.getElementById('stModel').textContent = model;
            document.getElementById('stRam').textContent = ram;
            document.getElementById('stAndroid').textContent = androidMatch ? `Android ${androidMatch[1]}` : 'Não identificado';
        }

        function measureBrowserFps() {
            fpsFrameCount++;
            const now = performance.now();
            if (now - fpsLastTime >= 1000) {
                detectedFps = Math.round((fpsFrameCount * 1000) / (now - fpsLastTime));
                fpsFrameCount = 0;
                fpsLastTime = now;
                const el = document.getElementById('stFps');
                if (el) el.textContent = `${detectedFps} FPS (navegador)`;
            }
            requestAnimationFrame(measureBrowserFps);
        }
        requestAnimationFrame(measureBrowserFps);

        function formatRemaining(diff) {
            if (diff <= 0) return 'Expirado';
            let seconds = Math.floor(diff / 1000);
            const days = Math.floor(seconds / 86400); seconds %= 86400;
            const hours = Math.floor(seconds / 3600); seconds %= 3600;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${days}d ${String(hours).padStart(2,'0')}h ${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`;
        }

        function updateKeyStatus() {
            if (!activeKeyData) return;
            const remaining = document.getElementById('stRemaining');
            if (!activeKeyData.expires) {
                document.getElementById('stExpires').textContent = 'Nunca';
                remaining.textContent = 'Ilimitado';
                remaining.style.color = 'var(--success)';
            } else {
                const diff = activeKeyData.expires - Date.now();
                document.getElementById('stExpires').textContent = new Date(activeKeyData.expires).toLocaleString('pt-BR');
                remaining.textContent = formatRemaining(diff);
                remaining.style.color = diff <= 0 ? 'var(--danger)' : 'var(--success)';
            }
        }

        function showKeyStatus() {
            if (!activeKeyData) return;
            document.getElementById('stKey').textContent = activeKeyData.key || '---';
            document.getElementById('stPlan').textContent = activeKeyData.duration === 'permanent' ? 'Permanente' : (activeKeyData.duration ? activeKeyData.duration + (String(activeKeyData.duration).endsWith('h') ? '' : ' dias') : 'Não informado');
            document.getElementById('stDevice').textContent = activeKeyData.device || getDeviceId();
            document.getElementById('stActivated').textContent = activeKeyData.activatedAt ? new Date(activeKeyData.activatedAt).toLocaleString('pt-BR') : 'Não registrada';
            detectDeviceInfo();
            updateKeyStatus();
            document.getElementById('modalStatus').classList.add('active');
            clearInterval(statusTimer);
            statusTimer = setInterval(updateKeyStatus, 1000);
        }

        // Fechar modal
        document.getElementById('closeStatus').onclick = () => {
            document.getElementById('modalStatus').classList.remove('active');
        };
        window.onclick = (event) => {
            if (event.target == document.getElementById('modalStatus')) {
                document.getElementById('modalStatus').classList.remove('active');
            }
        };

        // Evento de clique no nome MestreXit
        document.getElementById('userCreditBtn').onclick = showKeyStatus;

        document.getElementById('logoutKeyBtn').onclick = () => {
            localStorage.removeItem(KEY_UNLOCKED);
            localStorage.removeItem(ACTIVE_KEY);
            activeKeyData = null;
            document.getElementById('modalStatus').classList.remove('active');
            Object.values(pages).forEach(p => p.classList.remove('active'));
            keyPage.classList.add('active');
            mainHeader.style.display = 'none';
            siteFooter.style.display = 'none';
            siteWatermark.style.display = 'none';
            const remembered = localStorage.getItem(REMEMBERED_KEY);
            accessKeyInput.value = remembered || '';
            rememberKey.checked = !!remembered;
            window.scrollTo({top:0, behavior:'smooth'});
        };

        // Gerar ou recuperar ID único do dispositivo (HWID / LocalStorage)
        function getDeviceId() {
            let devId = localStorage.getItem('mx_device_id');
            if (!devId) {
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                let s = 'DEV-';
                for(let i=0; i<12; i++) s += chars[Math.floor(Math.random()*chars.length)];
                devId = s;
                localStorage.setItem('mx_device_id', devId);
            }
            return devId;
        }

        async function tryKey() {
            const keyVal = accessKeyInput.value.trim();
            if (!keyVal) {
                keyStatus.style.color = 'var(--danger)';
                keyStatus.textContent = '⚠️ Digite uma Key para continuar.';
                accessKeyInput.focus();
                return;
            }

            if (rememberKey.checked) localStorage.setItem(REMEMBERED_KEY, keyVal);
            else localStorage.removeItem(REMEMBERED_KEY);

            keyStatus.style.color = 'var(--secondary)';
            keyStatus.textContent = '🔄 Verificando key no Firebase...';

            try {
                const docRef = doc(db, "keys", keyVal);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    keyStatus.style.color = 'var(--danger)';
                    keyStatus.textContent = '❌ Key inválida ou não encontrada.';
                    return;
                }

                const data = docSnap.data();

                if (data.paused) {
                    keyStatus.style.color = 'var(--danger)';
                    keyStatus.textContent = '⏸️ Esta key está pausada pelo administrador.';
                    return;
                }

                if (data.expires && Date.now() >= data.expires) {
                    keyStatus.style.color = 'var(--danger)';
                    keyStatus.textContent = '⏰ Esta key está expirada.';
                    return;
                }

                const currentDevId = getDeviceId();

                // Primeira ativação: grava o dispositivo, a data de ativação e a expiração.
                // O prazo NÃO começa na criação da Key.
                if (!data.device || data.device === '') {
                    const now = Date.now();
                    const updates = { device: currentDevId };

                    if (data.activatedAt == null) {
                        updates.activatedAt = now;

                        if (data.duration === 'permanent') {
                            updates.expires = null;
                        } else {
                            const rawDuration = String(data.duration || '').trim().toLowerCase();
                            let durationMs;
                            if (/^\d+(?:\.\d+)?h$/.test(rawDuration)) {
                                durationMs = Number.parseFloat(rawDuration) * 3600000;
                            } else {
                                const days = Number(rawDuration);
                                durationMs = Number.isFinite(days) && days > 0 ? days * 86400000 : NaN;
                            }
                            if (!Number.isFinite(durationMs) || durationMs <= 0) {
                                keyStatus.style.color = 'var(--danger)';
                                keyStatus.textContent = '❌ Duração da key inválida. Use dias ou 1h.';
                                return;
                            }
                            updates.expires = now + durationMs;
                        }
                    }

                    await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js").then(async ({ updateDoc }) => {
                        await updateDoc(docRef, updates);
                    });

                    // Atualiza os dados locais imediatamente para o painel mostrar a validade correta.
                    Object.assign(data, updates);
                } else if (data.device !== currentDevId) {
                    keyStatus.style.color = 'var(--danger)';
                    keyStatus.textContent = '❌ Esta key já está em uso em outro aparelho/navegador!';
                    return;
                }

                keyStatus.style.color = 'var(--success)';
                keyStatus.textContent = '✓ Key válida! Liberando acesso...';
                setTimeout(() => unlockSite(keyVal, data), 600);

            } catch (err) {
                console.error("Erro ao verificar key:", err);
                keyStatus.style.color = 'var(--danger)';
                keyStatus.textContent = '❌ Erro de conexão com o Firebase.';
            }
        }

        window.tryKey = tryKey;

        // Botão "Colar Key": limpa o campo e cola o conteúdo atual da área de transferência.
        pasteKeyBtn.addEventListener('click', async () => {
            accessKeyInput.value = '';
            accessKeyInput.focus();

            try {
                if (!navigator.clipboard || !navigator.clipboard.readText) {
                    throw new Error('Clipboard API indisponível');
                }

                const clipboardText = await navigator.clipboard.readText();
                accessKeyInput.value = clipboardText.trim();
                keyStatus.style.color = 'var(--success)';
                keyStatus.textContent = accessKeyInput.value
                    ? '✓ Key colada com sucesso!'
                    : '⚠️ A área de transferência está vazia.';
            } catch (err) {
                console.error('Erro ao colar Key:', err);
                keyStatus.style.color = 'var(--danger)';
                keyStatus.textContent = '❌ Não foi possível acessar a área de transferência. Permita o acesso ao colar.';
            }
        });

        enterKeyBtn.addEventListener('click', tryKey);
        accessKeyInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') tryKey();
        });

        const rememberedKey = localStorage.getItem(REMEMBERED_KEY);
        if (rememberedKey) {
            accessKeyInput.value = rememberedKey;
            rememberKey.checked = true;
        }

        if (localStorage.getItem(KEY_UNLOCKED) === '1') {
            const savedKey = localStorage.getItem(ACTIVE_KEY);
            if (savedKey) {
                // Nunca libera automaticamente uma Key salva sem revalidar sua validade.
                accessKeyInput.value = savedKey;
                tryKey();
            } else {
                localStorage.removeItem(KEY_UNLOCKED);
            }
        }

        // Data for the generator - Updated for Free Fire 2026 (up to 200%)
        const proPlayers2026 = {
            "Nobru 2026": { 
                geral: 180, mira: 165, reddot: 155, x2: 145, x4: 130, miraSniper: 110,
                descricao: "Configuração agressiva para jogadas ofensivas",
                dpi: 650, estilo: "Agressivo 4 dedos", categoria: "capa"
            },
            "Cerrato Elite": { 
                geral: 195, mira: 180, reddot: 170, x2: 160, x4: 145, miraSniper: 125,
                descricao: "Alta sensibilidade para rotação rápida",
                dpi: 700, estilo: "Claw avançado", categoria: "capa"
            },
            "Loud Edition": { 
                geral: 170, mira: 150, reddot: 140, x2: 130, x4: 120, miraSniper: 100,
                descricao: "Equilíbrio perfeito entre controle e velocidade",
                dpi: 600, estilo: "Híbrido 3-4 dedos", categoria: "controle"
            },
            "Imperador Pro": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Foco em precisão com alta sensibilidade",
                dpi: 680, estilo: "Precisão extrema", categoria: "controle"
            },
            "Nova Geração": { 
                geral: 200, mira: 190, reddot: 180, x2: 170, x4: 155, miraSniper: 140,
                descricao: "Máxima sensibilidade para jogadores experientes",
                dpi: 750, estilo: "Claw profissional", categoria: "capa"
            },
            "DEW Pro 2026": { 
                geral: 175, mira: 160, reddot: 150, x2: 140, x4: 125, miraSniper: 105,
                descricao: "Configuração equilibrada para combate versátil",
                dpi: 620, estilo: "Claw 4 dedos", categoria: "controle"
            },
            "Rai Star Pro": { 
                geral: 190, mira: 175, reddot: 165, x2: 155, x4: 140, miraSniper: 120,
                descricao: "Alta sensibilidade para rotação e mira rápida",
                dpi: 710, estilo: "Agressivo 4 dedos", categoria: "capa"
            },
            "Moshi Elite": { 
                geral: 165, mira: 150, reddot: 140, x2: 130, x4: 115, miraSniper: 95,
                descricao: "Controle preciso para tiros de longa distância",
                dpi: 580, estilo: "Híbrido 3-4 dedos", categoria: "controle"
            },
            "Killer FF": { 
                geral: 200, mira: 185, reddot: 175, x2: 165, x4: 150, miraSniper: 135,
                descricao: "Configuração extrema para jogadas agressivas",
                dpi: 770, estilo: "Claw profissional", categoria: "capa"
            },
            "TheCruz Pro": { 
                geral: 180, mira: 165, reddot: 155, x2: 145, x4: 130, miraSniper: 110,
                descricao: "Estilo equilibrado para suporte e ofensiva",
                dpi: 640, estilo: "Claw 4 dedos", categoria: "controle"
            },
            "Joena 2026": { 
                geral: 170, mira: 155, reddot: 145, x2: 135, x4: 120, miraSniper: 100,
                descricao: "Precisão e controle para combate tático",
                dpi: 600, estilo: "Híbrido 3-4 dedos", categoria: "controle"
            },
            "MT7 Pro": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Configuração ofensiva para domínio de área",
                dpi: 660, estilo: "Claw 4 dedos", categoria: "capa"
            },
            "Bops Elite": { 
                geral: 195, mira: 180, reddot: 170, x2: 160, x4: 145, miraSniper: 125,
                descricao: "Alta sensibilidade para jogadas rápidas e precisas",
                dpi: 720, estilo: "Claw avançado", categoria: "capa"
            },
            "But 2026": { 
                geral: 175, mira: 160, reddot: 150, x2: 140, x4: 125, miraSniper: 105,
                descricao: "Configuração versátil para diversos estilos de jogo",
                dpi: 630, estilo: "Claw 4 dedos", categoria: "controle"
            },
            // Novos jogadores famosos adicionados
            "Fantasensi Pro": { 
                geral: 195, mira: 185, reddot: 175, x2: 165, x4: 150, miraSniper: 130,
                descricao: "Configuração extrema para jogadas de capa máxima",
                dpi: 780, estilo: "Claw extremo 5 dedos", categoria: "capa"
            },
            "Cerol Elite": { 
                geral: 190, mira: 180, reddot: 170, x2: 160, x4: 145, miraSniper: 125,
                descricao: "Sensibilidade alta para rush e jogadas rápidas",
                dpi: 750, estilo: "Agressivo 4 dedos", categoria: "capa"
            },
            "Boca de 09 Pro": { 
                geral: 170, mira: 155, reddot: 145, x2: 135, x4: 120, miraSniper: 100,
                descricao: "Configuração equilibrada com foco em precisão",
                dpi: 620, estilo: "Controle 3 dedos", categoria: "controle"
            },
            "Black Pro 2026": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Estilo híbrido para jogadas versáteis e precisas",
                dpi: 680, estilo: "Híbrido 4 dedos", categoria: "controle"
            },
            "N4444 Extreme": { 
                geral: 200, mira: 190, reddot: 180, x2: 170, x4: 155, miraSniper: 140,
                descricao: "Configuração máxima para domínio total no combate",
                dpi: 800, estilo: "Claw profissional", categoria: "capa"
            },
            "CJX Pro": { 
                geral: 175, mira: 160, reddot: 150, x2: 140, x4: 125, miraSniper: 105,
                descricao: "Configuração equilibrada para suporte e ofensiva",
                dpi: 630, estilo: "Claw 4 dedos", categoria: "controle"
            },
            "LOUD AYR": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Configuração ofensiva para domínio de área",
                dpi: 690, estilo: "Agressivo 4 dedos", categoria: "capa"
            },
            "Foxy Pro": { 
                geral: 165, mira: 150, reddot: 140, x2: 130, x4: 115, miraSniper: 95,
                descricao: "Controle máximo para tiros precisos à distância",
                dpi: 590, estilo: "Precisão 3 dedos", categoria: "controle"
            },
            "Squadra Elite": { 
                geral: 190, mira: 175, reddot: 165, x2: 155, x4: 140, miraSniper: 120,
                descricao: "Alta sensibilidade para jogadas em equipe agressivas",
                dpi: 730, estilo: "Claw 4 dedos", categoria: "capa"
            },
            "Tropa de Elite": { 
                geral: 180, mira: 165, reddot: 155, x2: 145, x4: 130, miraSniper: 110,
                descricao: "Configuração versátil para diversos mapas e modos",
                dpi: 650, estilo: "Híbrido 4 dedos", categoria: "controle"
            },
            "KAKASHI FF": { 
                geral: 195, mira: 180, reddot: 170, x2: 160, x4: 145, miraSniper: 125,
                descricao: "Configuração rápida para jogadas surpresa",
                dpi: 760, estilo: "Claw extremo", categoria: "capa"
            },
            "UNKNOWN PRO": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Configuração misteriosa com desempenho máximo",
                dpi: 700, estilo: "Claw avançado", categoria: "capa"
            }
        };

        // Mais presets de jogadores/famosos — valores são presets do gerador, não configurações oficiais.
        Object.assign(proPlayers2026, {
            "Bak 2026": { geral: 190, mira: 178, reddot: 168, x2: 158, x4: 142, miraSniper: 122, descricao: "Preset de alta velocidade para capa e movimentação", dpi: 720, estilo: "Claw 4 dedos", categoria: "capa" },
            "Thurzin 2026": { geral: 185, mira: 172, reddot: 162, x2: 152, x4: 138, miraSniper: 118, descricao: "Preset equilibrado para precisão e trocas rápidas", dpi: 690, estilo: "Híbrido 4 dedos", categoria: "controle" },
            "Kroonos 2026": { geral: 195, mira: 182, reddot: 172, x2: 162, x4: 147, miraSniper: 128, descricao: "Preset agressivo para puxadas rápidas", dpi: 740, estilo: "Claw avançado", categoria: "capa" },
            "Two9 2026": { geral: 180, mira: 168, reddot: 158, x2: 148, x4: 134, miraSniper: 114, descricao: "Preset focado em estabilidade e precisão", dpi: 670, estilo: "4 dedos controle", categoria: "controle" },
            "JapaBKR 2026": { geral: 192, mira: 180, reddot: 170, x2: 160, x4: 145, miraSniper: 124, descricao: "Preset rápido para combate próximo", dpi: 730, estilo: "Claw 4 dedos", categoria: "capa" },
            "Ruan da VK 2026": { geral: 188, mira: 175, reddot: 165, x2: 155, x4: 140, miraSniper: 120, descricao: "Preset híbrido para consistência em diferentes armas", dpi: 700, estilo: "Híbrido 4 dedos", categoria: "controle" },
            "Fac 2026": { geral: 198, mira: 187, reddot: 177, x2: 167, x4: 152, miraSniper: 132, descricao: "Preset agressivo para capa e movimentação rápida", dpi: 760, estilo: "Claw profissional", categoria: "capa" },
            "Babi 2026": { geral: 175, mira: 162, reddot: 152, x2: 142, x4: 127, miraSniper: 108, descricao: "Preset equilibrado para controle e precisão", dpi: 640, estilo: "3-4 dedos", categoria: "controle" },
            "Federal 2026": { geral: 183, mira: 170, reddot: 160, x2: 150, x4: 136, miraSniper: 116, descricao: "Preset versátil para partidas competitivas", dpi: 680, estilo: "4 dedos", categoria: "controle" },
            "Nobru Capa 2026": { geral: 200, mira: 190, reddot: 180, x2: 170, x4: 155, miraSniper: 138, descricao: "Preset agressivo de alta sensibilidade", dpi: 780, estilo: "Claw 5 dedos", categoria: "capa" },
            "Cerol 2026": { geral: 190, mira: 178, reddot: 168, x2: 158, x4: 143, miraSniper: 123, descricao: "Preset rápido para rush e trocas próximas", dpi: 750, estilo: "Agressivo 4 dedos", categoria: "capa" },
            "Mito 2026": { geral: 178, mira: 165, reddot: 155, x2: 145, x4: 130, miraSniper: 110, descricao: "Preset de controle para maior consistência", dpi: 650, estilo: "Híbrido 3-4 dedos", categoria: "controle" }
        });
        
        const twoThreeSettings2026 = {
            "Leve (2 dedos)": { 
                geral: 160, mira: 145, reddot: 135, x2: 125, x4: 110, miraSniper: 90,
                descricao: "Ideal para iniciantes que jogam com 2 dedos",
                dpi: 400, recomendacao: "Perfeito para controle total e precisão",
                categoria: "controle"
            },
            "Médio (2-3 dedos)": { 
                geral: 175, mira: 160, reddot: 150, x2: 140, x4: 125, miraSniper: 105,
                descricao: "Equilíbrio perfeito para jogadores intermediários",
                dpi: 550, recomendacao: "Oferece boa rotação com controle",
                categoria: "controle"
            },
            "Avançado (3 dedos)": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Para jogadores que dominam 3 dedos",
                dpi: 650, recomendacao: "Rotações rápidas mantendo precisão",
                categoria: "capa"
            },
            "Agressivo (2-3 dedos)": { 
                geral: 195, mira: 180, reddot: 170, x2: 160, x4: 145, miraSniper: 125,
                descricao: "Alta sensibilidade para jogadas ofensivas",
                dpi: 700, recomendacao: "Ideal para rush e combate próximo",
                categoria: "capa"
            },
            "Precisão (3 dedos)": { 
                geral: 170, mira: 155, reddot: 145, x2: 135, x4: 120, miraSniper: 100,
                descricao: "Foco em precisão para tiros de longa distância",
                dpi: 600, recomendacao: "Controle máximo para snipers",
                categoria: "controle"
            }
        };
        
        const weapons2026 = {
            "AR (Assalto)": { 
                geral: 175, mira: 160, reddot: 150, x2: 140, x4: 130, miraSniper: 110,
                descricao: "Otimizado para rifles de assalto como AK47, M4A1, SCAR",
                recomendacao: "Ideal para combate médio-longo alcance"
            },
            "SMG (Submetralhadora)": { 
                geral: 190, mira: 175, reddot: 165, x2: 155, x4: 140, miraSniper: 120,
                descricao: "Perfeito para MP40, P90, Thompson em combate curto",
                recomendacao: "Alta sensibilidade para movimentos rápidos"
            },
            "Sniper": { 
                geral: 150, mira: 130, reddot: 120, x2: 110, x4: 100, miraSniper: 85,
                descricao: "Configuração de precisão para AWM, Kar98k, M82B",
                recomendacao: "Baixa sensibilidade para precisão extrema"
            },
            "Shotgun (Escopeta)": { 
                geral: 200, mira: 185, reddot: 175, x2: 165, x4: 150, miraSniper: 130,
                descricao: "Máxima sensibilidade para M1014, SPAS12, M1887",
                recomendacao: "Para combate corpo a corpo agressivo"
            },
            "Pistola": { 
                geral: 185, mira: 170, reddot: 160, x2: 150, x4: 135, miraSniper: 115,
                descricao: "Otimizado para Desert Eagle, M500, G18",
                recomendacao: "Controle rápido em situações de emergência"
            },
            "LMG (Metralhadora)": { 
                geral: 165, mira: 150, reddot: 140, x2: 130, x4: 120, miraSniper: 105,
                descricao: "Para M60, M249, MG3 com controle de recuo",
                recomendacao: "Sensibilidade média para controle sustentado"
            }
        };
        
        const dpiSettings2026 = {
            "Baixo (1-2 dedos)": { 
                dpi: 400, sensibilidadeGeral: 180, 
                descricao: "Ideal para iniciantes ou jogadores que usam 1-2 dedos",
                recomendacao: "Oferece maior controle para movimentos básicos"
            },
            "Médio (2-3 dedos)": { 
                dpi: 550, sensibilidadeGeral: 165, 
                descricao: "Perfeito para jogadores intermediários com 2-3 dedos",
                recomendacao: "Equilíbrio entre controle e velocidade de rotação"
            },
            "Alto (4 dedos)": { 
                dpi: 700, sensibilidadeGeral: 150, 
                descricao: "Otimizado para jogadores avançados com 4 dedos",
                recomendacao: "Permite rotações rápidas mantendo precisão"
            },
            "Claw (4+ dedos)": { 
                dpi: 850, sensibilidadeGeral: 135, 
                descricao: "Configuração profissional para claw avançado",
                recomendacao: "Máximo controle com movimentos complexos"
            },
            "Extremo (Pro)": { 
                dpi: 1000, sensibilidadeGeral: 120, 
                descricao: "Para jogadores profissionais que exigem precisão extrema",
                recomendacao: "DPI máximo com sensibilidade ajustada para precisão"
            }
        };
        
        // DOM Elements
        const pages = {
            home: document.getElementById('homePage'),
            pro: document.getElementById('proPage'),
            twoThree: document.getElementById('twoThreePage'),
            random: document.getElementById('randomPage'),
            weapon: document.getElementById('weaponPage'),
            dpi: document.getElementById('dpiPage'),
            optimization: document.getElementById('optimizationPage'),
            info: document.getElementById('infoPage')
        };
        
        const navButtons = {
            home: document.getElementById('homeBtn'),
            pro: document.getElementById('proBtn'),
            twoThree: document.getElementById('twoThreeBtn'),
            random: document.getElementById('randomBtn'),
            weapon: document.getElementById('weaponBtn'),
            dpi: document.getElementById('dpiBtn'),
            optimization: document.getElementById('optimizationNavBtn'),
            info: document.getElementById('infoBtn')
        };
        
        const homeButtons = {
            pro: document.getElementById('homeProBtn'),
            twoThree: document.getElementById('homeTwoThreeBtn'),
            random: document.getElementById('homeRandomBtn'),
            weapon: document.getElementById('homeWeaponBtn'),
            dpi: document.getElementById('homeDpiBtn'),
            optimization: document.getElementById('optimizationBtn')
        };
        
        const backButtons = {
            pro: document.getElementById('backFromPro'),
            twoThree: document.getElementById('backFromTwoThree'),
            random: document.getElementById('backFromRandom'),
            weapon: document.getElementById('backFromWeapon'),
            dpi: document.getElementById('backFromDpi'),
            optimization: document.getElementById('backFromOptimization'),
            info: document.getElementById('backFromInfo')
        };
        
        const notification = document.getElementById('notification');
        let currentPage = 'home';
        let currentSettings = {};
        let currentType = "";
        let currentFilter = "todos";
        
        // Initialize the page
        function init() {
            // Set up navigation
            setupNavigation();
            
            // Set up home page buttons
            setupHomeButtons();
            
            // Set up back buttons
            setupBackButtons();
            
            // Initialize pro players page
            initProPage();
            
            // Initialize 2-3 dedos page
            initTwoThreePage();
            
            // Initialize random page
            initRandomPage();
            
            // Initialize weapon page
            initWeaponPage();
            
            // Initialize DPI page
            initDpiPage();
            
            // Carrega histórico/favoritos sem gerar uma configuração automaticamente
            renderHistory();
            renderFavorites();
            
            setupOptimization();
            setupInfoPage();

            // Setup filter buttons
            setupFilterButtons();
        }
        
        function setupNavigation() {
            // Navigation buttons
            navButtons.home.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
            
            navButtons.pro.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('pro');
            });
            
            navButtons.twoThree.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('twoThree');
            });
            
            navButtons.random.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('random');
            });
            
            navButtons.weapon.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('weapon');
            });
            
            navButtons.dpi.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('dpi');
            });

            navButtons.optimization.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('optimization');
            });

            navButtons.info.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('info');
            });
            
            // Home logo link
            document.getElementById('homeLink').addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
        }
        
        function setupHomeButtons() {
            homeButtons.pro.addEventListener('click', () => {
                switchPage('pro');
            });
            
            homeButtons.twoThree.addEventListener('click', () => {
                switchPage('twoThree');
            });
            
            homeButtons.random.addEventListener('click', () => {
                switchPage('random');
            });
            
            homeButtons.weapon.addEventListener('click', () => {
                switchPage('weapon');
            });
            
            homeButtons.dpi.addEventListener('click', () => {
                switchPage('dpi');
            });
            
            homeButtons.optimization.addEventListener('click', () => {
                switchPage('optimization');
            });
        }
        
        function setupBackButtons() {
            backButtons.pro.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
            
            backButtons.twoThree.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
            
            backButtons.random.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
            
            backButtons.weapon.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
            
            backButtons.dpi.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });

            backButtons.optimization.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });

            backButtons.info.addEventListener('click', (e) => {
                e.preventDefault();
                switchPage('home');
            });
        }
        

        // ===== INFO DO DISPOSITIVO =====
        function setupInfoPage() {
            const ua = navigator.userAgent || "";
            const androidMatch = ua.match(/Android\s+([0-9.]+)/i);

            let marca = "Android";
            let modelo = "Dispositivo";
            if (/Samsung/i.test(ua)) marca = "Samsung";
            else if (/Xiaomi|Redmi|POCO/i.test(ua)) marca = "Xiaomi";
            else if (/Motorola|moto/i.test(ua)) marca = "Motorola";
            else if (/Huawei/i.test(ua)) marca = "Huawei";
            else if (/OPPO/i.test(ua)) marca = "OPPO";
            else if (/vivo/i.test(ua)) marca = "vivo";
            else if (/OnePlus/i.test(ua)) marca = "OnePlus";
            else if (/Realme/i.test(ua)) marca = "Realme";

            const modelMatch = ua.match(/;\s*([^;)]+?)\s+Build\//i);
            if (modelMatch) modelo = modelMatch[1].trim();

            document.getElementById("infoMarca").textContent = marca;
            document.getElementById("infoModelo").textContent = modelo;
            document.getElementById("infoAndroid").textContent =
                androidMatch ? "Android " + androidMatch[1] : "Android";

            document.getElementById("infoRam").textContent =
                navigator.deviceMemory ? navigator.deviceMemory + " GB (estimada)" : "Não disponível";

            // FPS disponível no navegador.
            let frames = 0;
            let last = performance.now();
            function measureFPS(now) {
                frames++;
                if (now - last >= 1000) {
                    const fps = Math.round(frames * 1000 / (now - last));
                    const el = document.getElementById("infoFps");
                    if (el) el.textContent = fps + " FPS";
                    frames = 0;
                    last = now;
                }
                requestAnimationFrame(measureFPS);
            }
            requestAnimationFrame(measureFPS);

            // Tempo em tempo real = quanto falta para a Key expirar.
            function updateInfoTime() {
                const el = document.getElementById("infoTempo");
                if (!el) return;

                if (activeKeyData && activeKeyData.expires) {
                    el.textContent = formatRemaining(activeKeyData.expires - Date.now());
                    el.style.color = (activeKeyData.expires - Date.now()) <= 0 ? "var(--danger)" : "var(--success)";
                } else if (activeKeyData && activeKeyData.duration === "permanent") {
                    el.textContent = "Ilimitado";
                    el.style.color = "var(--success)";
                } else {
                    el.textContent = "Key não ativada";
                }

                const planoEl = document.getElementById("infoPlano");
                const ativacaoEl = document.getElementById("infoAtivacao");
                if (activeKeyData) {
                    planoEl.textContent = activeKeyData.duration === "permanent"
                        ? "Permanente"
                        : (activeKeyData.duration ? activeKeyData.duration + (String(activeKeyData.duration).endsWith("h") ? "" : " dias") : "Não informado");
                    ativacaoEl.textContent = activeKeyData.activatedAt
                        ? new Date(activeKeyData.activatedAt).toLocaleString("pt-BR")
                        : "Não registrada";
                }
            }

            updateInfoTime();
            clearInterval(window.mxInfoRemainingTimer);
            window.mxInfoRemainingTimer = setInterval(updateInfoTime, 1000);

            // Fallback para dados antigos salvos no navegador, sem substituir os dados reais da Key.
            if (!activeKeyData) {
                const plano = localStorage.getItem("planoAtual") || localStorage.getItem("plan") || localStorage.getItem("plano");
                const ativacao = localStorage.getItem("dataAtivacao") || localStorage.getItem("activationDate") || localStorage.getItem("activatedAt");
                if (plano) document.getElementById("infoPlano").textContent = plano;
                if (ativacao) {
                    const d = new Date(ativacao);
                    document.getElementById("infoAtivacao").textContent =
                        isNaN(d.getTime()) ? ativacao : d.toLocaleString("pt-BR");
                }
            }

            const backToKey = document.getElementById("backToKeyFromInfo");
            if (backToKey && !backToKey.dataset.bound) {
                backToKey.dataset.bound = "1";
                backToKey.addEventListener("click", (e) => {
                    e.preventDefault();
                    Object.values(pages).forEach(p => p.classList.remove("active"));
                    keyPage.classList.add("active");
                    mainHeader.style.display = "none";
                    siteFooter.style.display = "none";
                    siteWatermark.style.display = "none";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                });
            }
        }

        function setupOptimization() {
            const checks = document.querySelectorAll('.optimization-check');
            const button = document.getElementById('activateOptimization');
            const progress = document.getElementById('optimizationProgress');
            const bar = document.getElementById('optimizationProgressBar');
            const status = document.getElementById('optimizationStatus');

            button.addEventListener('click', () => {
                const selected = [...checks].filter(c => c.checked);
                if (!selected.length) {
                    status.style.color = 'var(--danger)';
                    status.textContent = '⚠️ Selecione uma função';
                    return;
                }
                button.disabled = true;
                button.style.opacity = '.7';
                status.style.color = 'var(--secondary)';
                status.textContent = '⏳ Preparando recomendações...';
                progress.classList.add('active');
                bar.style.width = '0%';
                let value = 0;
                const timer = setInterval(() => {
                    value += Math.floor(Math.random() * 9) + 5;
                    if (value >= 100) {
                        value = 100;
                        clearInterval(timer);
                        status.style.color = 'var(--success)';
                        status.textContent = '✓ Rotina de otimização concluída';
                        setTimeout(() => {
                            selected.forEach(c => c.checked = false);
                            progress.classList.remove('active');
                            bar.style.width = '0%';
                            status.textContent = '';
                            button.disabled = false;
                            button.style.opacity = '1';
                            switchPage('home');
                        }, 1200);
                    }
                    bar.style.width = value + '%';
                }, 120);
            });
        }

        function setupFilterButtons() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active class from all filter buttons
                    filterButtons.forEach(b => b.classList.remove('active'));
                    
                    // Add active class to clicked button
                    btn.classList.add('active');
                    
                    // Get filter value
                    currentFilter = btn.dataset.filter;
                    
                    // Apply filter to pro players
                    filterProPlayers(currentFilter);
                });
            });
        }
        
        function switchPage(pageName) {
            // Hide all pages
            Object.values(pages).forEach(page => {
                page.classList.remove('active');
            });
            
            // Remove active class from all nav buttons
            Object.values(navButtons).forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Show selected page
            pages[pageName].classList.add('active');
            
            // Activate corresponding nav button
            navButtons[pageName].classList.add('active');
            
            // Update current page
            currentPage = pageName;
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Reset filter to "todos" when entering pro page
            if (pageName === 'pro') {
                currentFilter = "todos";
                const filterButtons = document.querySelectorAll('.filter-btn');
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.filter === 'todos') {
                        btn.classList.add('active');
                    }
                });
                filterProPlayers('todos');
            }
        }
        
        function initProPage() {
            // Initial render of pro players
            filterProPlayers('todos');
        }
        
        function filterProPlayers(filter) {
            const proSelectionGrid = document.getElementById('proSelectionGrid');
            proSelectionGrid.innerHTML = '';
            
            // Filter players based on category
            let filteredPlayers = {};
            
            if (filter === 'todos') {
                filteredPlayers = proPlayers2026;
            } else {
                Object.entries(proPlayers2026).forEach(([playerName, data]) => {
                    if (data.categoria === filter) {
                        filteredPlayers[playerName] = data;
                    }
                });
            }
            
            // Create player selection cards
            Object.entries(filteredPlayers).forEach(([playerName, data]) => {
                const playerCard = document.createElement('div');
                playerCard.className = 'selection-card';
                playerCard.dataset.player = playerName;
                
                // Add tag for categoria
                const tagClass = data.categoria === 'capa' ? 'tag-capa' : 'tag-controle';
                const tagText = data.categoria === 'capa' ? '+ CAPA' : '+ CONTROLE';
                
                playerCard.innerHTML = `
                    <div class="player-tag ${tagClass}">${tagText}</div>
                    <i class="fas fa-user-ninja selection-icon"></i>
                    <div class="selection-name">${playerName}</div>
                    <div class="selection-desc">${data.estilo}</div>
                `;
                
                playerCard.addEventListener('click', () => {
                    // Remove active class from all cards
                    document.querySelectorAll('#proSelectionGrid .selection-card').forEach(card => {
                        card.classList.remove('active');
                    });
                    
                    // Add active class to clicked card
                    playerCard.classList.add('active');
                    
                    // Display player settings
                    displayProSettings(playerName);
                });
                
                proSelectionGrid.appendChild(playerCard);
            });
            
            // Activate first player by default
            if (proSelectionGrid.firstChild) {
                proSelectionGrid.firstChild.classList.add('active');
                displayProSettings(Object.keys(filteredPlayers)[0]);
            }
        }
        
        function displayProSettings(playerName) {
            const settings = proPlayers2026[playerName];
            currentSettings = {...settings, player: playerName};
            currentType = "pro";
            
            const displayContainer = document.getElementById('proSettingsDisplay');
            
            // Create settings display
            const settingsContent = document.createElement('div');
            settingsContent.innerHTML = `
                <div class="settings-grid">
                    <div class="setting-item" style="grid-column: 1 / -1;">
                        <div class="setting-label">Jogador Profissional</div>
                        <div class="setting-value" style="color: var(--gold);">${playerName}</div>
                        <div style="color: var(--secondary); margin-top: 10px; font-size: 1.1rem;">${settings.descricao}</div>
                        <div style="color: rgba(240, 248, 255, 0.7); margin-top: 5px;">
                            <span style="color: ${settings.categoria === 'capa' ? 'var(--capa)' : 'var(--controle)'}; font-weight: bold;">
                                ${settings.categoria === 'capa' ? '+ CAPA (Agresivo)' : '+ CONTROLE (Precisão)'}
                            </span> | 
                            Estilo: ${settings.estilo} | DPI: ${settings.dpi}
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Geral</div>
                        <div class="setting-value">${settings.geral}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira (Iron Sight)</div>
                        <div class="setting-value">${settings.mira}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Vermelha</div>
                        <div class="setting-value">${settings.reddot}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 2x</div>
                        <div class="setting-value">${settings.x2}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 4x</div>
                        <div class="setting-value">${settings.x4}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Sniper</div>
                        <div class="setting-value">${settings.miraSniper}<span class="setting-unit">%</span></div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="card-btn copy-btn" id="copyProSettings">
                        <i class="far fa-copy"></i> Copiar Configurações
                    </button>
                </div>
            `;
            
            // Clear and update display
            displayContainer.innerHTML = '';
            displayContainer.appendChild(settingsContent);
            
            // Add copy functionality
            document.getElementById('copyProSettings').addEventListener('click', copySettingsToClipboard);
        }
        
        function initTwoThreePage() {
            const twoThreeSelectionGrid = document.getElementById('twoThreeSelectionGrid');
            twoThreeSelectionGrid.innerHTML = '';
            
            // Create selection cards
            Object.entries(twoThreeSettings2026).forEach(([settingName, data]) => {
                const settingCard = document.createElement('div');
                settingCard.className = 'selection-card';
                settingCard.dataset.setting = settingName;
                
                // Add tag for categoria
                const tagClass = data.categoria === 'capa' ? 'tag-capa' : 'tag-controle';
                const tagText = data.categoria === 'capa' ? '+ CAPA' : '+ CONTROLE';
                
                settingCard.innerHTML = `
                    <div class="player-tag ${tagClass}">${tagText}</div>
                    <i class="fas fa-hand-peace selection-icon"></i>
                    <div class="selection-name">${settingName}</div>
                    <div class="selection-desc">${data.recomendacao}</div>
                `;
                
                settingCard.addEventListener('click', () => {
                    // Remove active class from all cards
                    document.querySelectorAll('#twoThreeSelectionGrid .selection-card').forEach(card => {
                        card.classList.remove('active');
                    });
                    
                    // Add active class to clicked card
                    settingCard.classList.add('active');
                    
                    // Display settings
                    displayTwoThreeSettings(settingName);
                });
                
                twoThreeSelectionGrid.appendChild(settingCard);
            });
            
            // Activate first setting by default
            if (twoThreeSelectionGrid.firstChild) {
                twoThreeSelectionGrid.firstChild.classList.add('active');
                displayTwoThreeSettings(Object.keys(twoThreeSettings2026)[0]);
            }
        }
        
        function displayTwoThreeSettings(settingName) {
            const settings = twoThreeSettings2026[settingName];
            currentSettings = {...settings, setting: settingName};
            currentType = "twoThree";
            
            const displayContainer = document.getElementById('twoThreeSettingsDisplay');
            
            // Create settings display
            const settingsContent = document.createElement('div');
            settingsContent.innerHTML = `
                <div class="settings-grid">
                    <div class="setting-item" style="grid-column: 1 / -1;">
                        <div class="setting-label">Configuração para 2-3 Dedos</div>
                        <div class="setting-value" style="color: var(--green);">${settingName}</div>
                        <div style="color: var(--secondary); margin-top: 10px; font-size: 1.1rem;">${settings.descricao}</div>
                        <div style="color: rgba(240, 248, 255, 0.7); margin-top: 5px;">
                            <span style="color: ${settings.categoria === 'capa' ? 'var(--capa)' : 'var(--controle)'}; font-weight: bold;">
                                ${settings.categoria === 'capa' ? '+ CAPA (Agresivo)' : '+ CONTROLE (Precisão)'}
                            </span> | 
                            ${settings.recomendacao} | DPI: ${settings.dpi}
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Geral</div>
                        <div class="setting-value">${settings.geral}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira (Iron Sight)</div>
                        <div class="setting-value">${settings.mira}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Vermelha</div>
                        <div class="setting-value">${settings.reddot}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 2x</div>
                        <div class="setting-value">${settings.x2}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 4x</div>
                        <div class="setting-value">${settings.x4}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Sniper</div>
                        <div class="setting-value">${settings.miraSniper}<span class="setting-unit">%</span></div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="card-btn copy-btn" id="copyTwoThreeSettings">
                        <i class="far fa-copy"></i> Copiar Configurações
                    </button>
                </div>
            `;
            
            // Clear and update display
            displayContainer.innerHTML = '';
            displayContainer.appendChild(settingsContent);
            
            // Add copy functionality
            document.getElementById('copyTwoThreeSettings').addEventListener('click', copySettingsToClipboard);
        }
        
        const HISTORY_KEY = 'mx_sensi_history_v2';
        const FAVORITES_KEY = 'mx_sensi_favorites_v2';

        function readStore(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
        function writeStore(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
        function clamp(v, min=0, max=200) { return Math.max(min, Math.min(max, Math.round(v))); }

        function getGeneratorProfile() {
            const device = document.getElementById('genDevice').value;
            const fingers = Number(document.getElementById('genFingers').value);
            const style = document.getElementById('genStyle').value;
            const weapon = document.getElementById('genWeapon').value;
            const dpi = Math.max(300, Math.min(1200, Number(document.getElementById('genDpi').value) || 600));
            const intensity = Number(document.getElementById('genIntensity').value) || 70;
            return { device, fingers, style, weapon, dpi, intensity };
        }

        function buildPersonalizedSettings(profile) {
            const baseByDevice = { entrada:150, intermediario:168, potente:182, gamer:190 };
            const styleBonus = { controle:-12, equilibrado:0, capa:12, rush:17 };
            const weaponBonus = { geral:0, smg:7, shotgun:11, ar:2, sniper:-18 };
            const fingerBonus = {2:-9,3:0,4:7,5:10};
            const intensityBonus = (profile.intensity - 70) * 0.28;

            // Gera uma variação nova a cada clique, mantendo o resultado coerente com o perfil.
            const variationRange = Math.max(4, Math.round(5 + (profile.intensity - 30) * 0.12));
            const randomOffset = () => Math.floor(Math.random() * (variationRange * 2 + 1)) - variationRange;

            const base = baseByDevice[profile.device] + styleBonus[profile.style] + weaponBonus[profile.weapon] + fingerBonus[profile.fingers] + intensityBonus;
            const dpiFactor = 600 / profile.dpi;
            const geral = clamp(base * dpiFactor + randomOffset());
            const mira = clamp(geral - (profile.weapon === 'sniper' ? 18 : 8) + randomOffset());
            const reddot = clamp(mira - 8 + randomOffset());
            const x2 = clamp(reddot - 9 + randomOffset());
            const x4 = clamp(x2 - 10 + randomOffset());
            const miraSniper = clamp(x4 - (profile.weapon === 'sniper' ? 4 : 14) + randomOffset());
            return {
                geral, mira, reddot, x2, x4, miraSniper, dpi: profile.dpi,
                device: profile.device, fingers: profile.fingers, style: profile.style, weapon: profile.weapon, intensity: profile.intensity,
                descricao: 'Configuração personalizada pelo perfil escolhido com variação única a cada geração', tipo: 'Sensi Personalizada'
            };
        }

        function profileLabels(p) {
            const d={entrada:'Entrada',intermediario:'Intermediário',potente:'Potente',gamer:'Gamer'};
            const st={controle:'Controle',equilibrado:'Equilibrado',capa:'Capa',rush:'Rush'};
            const w={geral:'Geral',smg:'SMG',shotgun:'Escopeta',ar:'AR',sniper:'Sniper'};
            return { device:d[p.device]||p.device, style:st[p.style]||p.style, weapon:w[p.weapon]||p.weapon };
        }

        function settingsSignature(s) { return [s.geral,s.mira,s.reddot,s.x2,s.x4,s.miraSniper,s.dpi,s.fingers,s.style,s.weapon].join('|'); }

        function saveHistory(settings) {
            const list = readStore(HISTORY_KEY).filter(x => x.signature !== settingsSignature(settings));
            list.unshift({ ...settings, signature: settingsSignature(settings), createdAt: Date.now() });
            writeStore(HISTORY_KEY, list.slice(0,12));
            renderHistory();
        }

        function isFavorite(settings) { return readStore(FAVORITES_KEY).some(x => x.signature === settingsSignature(settings)); }
        function toggleFavorite(settings) {
            let list = readStore(FAVORITES_KEY);
            const sig = settingsSignature(settings);
            if (list.some(x => x.signature === sig)) list = list.filter(x => x.signature !== sig);
            else list.unshift({ ...settings, signature:sig, createdAt:Date.now() });
            writeStore(FAVORITES_KEY, list.slice(0,20));
            renderFavorites(); renderRandomResult();
        }

        function renderHistory() {
            const box=document.getElementById('historyList'); if(!box) return;
            const list=readStore(HISTORY_KEY);
            box.innerHTML=list.length?list.map((x,i)=>`<div class="history-item"><div><strong>${x.geral}/${x.reddot}/${x.x2}/${x.x4}</strong><small>${new Date(x.createdAt).toLocaleString('pt-BR')} • DPI ${x.dpi} • ${x.fingers} dedos</small></div><button class="card-btn secondary" style="padding:8px 11px;font-size:.78rem" data-history="${i}">Usar</button></div>`).join(''):'<div class="history-empty">Nenhuma configuração gerada ainda.</div>';
            box.querySelectorAll('[data-history]').forEach(btn=>btn.onclick=()=>{const x=list[Number(btn.dataset.history)]; currentSettings={...x}; currentType='random'; renderRandomResult(); window.scrollTo({top:0,behavior:'smooth'});});
        }

        function renderFavorites() {
            const box=document.getElementById('favoritesList'); if(!box) return;
            const list=readStore(FAVORITES_KEY);
            box.innerHTML=list.length?list.map((x,i)=>`<div class="history-item"><div><strong>⭐ ${x.geral}/${x.reddot}/${x.x2}/${x.x4}</strong><small>DPI ${x.dpi} • ${x.fingers} dedos • ${x.style}</small></div><button class="card-btn secondary" style="padding:8px 11px;font-size:.78rem" data-fav="${i}">Usar</button></div>`).join(''):'<div class="history-empty">Nenhuma favorita salva.</div>';
            box.querySelectorAll('[data-fav]').forEach(btn=>btn.onclick=()=>{const x=list[Number(btn.dataset.fav)]; currentSettings={...x}; currentType='random'; renderRandomResult(); window.scrollTo({top:0,behavior:'smooth'});});
        }

        function initRandomPage() {
            document.getElementById('generateRandomBtn').addEventListener('click', generateRandomSettings);
            document.getElementById('clearGeneratorBtn').addEventListener('click', ()=>{ document.getElementById('randomSettingsDisplay').innerHTML=''; });
            document.getElementById('genIntensity').addEventListener('input',e=>document.getElementById('genIntensityValue').textContent=e.target.value);
            document.getElementById('clearHistoryBtn').addEventListener('click',()=>{writeStore(HISTORY_KEY,[]);renderHistory();});
            document.getElementById('clearFavoritesBtn').addEventListener('click',()=>{writeStore(FAVORITES_KEY,[]);renderFavorites();renderRandomResult();});
            renderHistory(); renderFavorites();
        }

        function renderRandomResult() {
            const settings=currentSettings;
            const displayContainer=document.getElementById('randomSettingsDisplay');
            if(!settings || !settings.geral){ displayContainer.innerHTML=''; return; }
            const p=profileLabels(settings);
            const favorite=isFavorite(settings);
            const settingsContent=document.createElement('div');
            settingsContent.innerHTML=`
                <div class="settings-grid">
                    <div class="setting-item" style="grid-column:1/-1;">
                        <div class="setting-label">Resultado</div><div class="setting-value" style="color:var(--accent);">${settings.tipo||'Sensi Personalizada'}</div>
                        <div class="result-meta"><span class="result-chip">📱 ${p.device||'Personalizado'}</span><span class="result-chip">👆 ${settings.fingers||'-'} dedos</span><span class="result-chip">🎯 ${p.style||'-'}</span><span class="result-chip">🔫 ${p.weapon||'-'}</span><span class="result-chip">📐 DPI ${settings.dpi||'-'}</span></div>
                        <div style="color:rgba(240,248,255,.7);">${settings.descricao||'Configuração recomendada.'}</div>
                    </div>
                    ${[['Geral',settings.geral],['Mira (Iron Sight)',settings.mira],['Mira Vermelha',settings.reddot],['Mira 2x',settings.x2],['Mira 4x',settings.x4],['Mira Sniper',settings.miraSniper]].map(a=>`<div class="setting-item"><div class="setting-label">${a[0]}</div><div class="setting-value">${a[1]}<span class="setting-unit">%</span></div></div>`).join('')}
                </div>
                <div class="settings-actions">
                    <button class="card-btn copy-btn" id="copyRandomSettings"><i class="far fa-copy"></i> Copiar</button>
                    <button class="card-btn" id="generateNewRandom"><i class="fas fa-redo"></i> Gerar Novamente</button>
                    <button class="card-btn secondary ${favorite?'favorite-active':''}" id="favoriteRandom"><i class="${favorite?'fas':'far'} fa-star"></i> ${favorite?'Favoritada':'Favoritar'}</button>
                </div>`;
            displayContainer.innerHTML=''; displayContainer.appendChild(settingsContent);
            document.getElementById('copyRandomSettings').onclick=copySettingsToClipboard;
            document.getElementById('generateNewRandom').onclick=generateRandomSettings;
            document.getElementById('favoriteRandom').onclick=()=>toggleFavorite(settings);
        }

        function generateRandomSettings() {
            const profile=getGeneratorProfile();
            currentSettings=buildPersonalizedSettings(profile);
            currentType='random';
            saveHistory(currentSettings);
            renderRandomResult();
        }

        function initWeaponPage() {
            const weaponSelectionGrid = document.getElementById('weaponSelectionGrid');
            weaponSelectionGrid.innerHTML = '';
            
            // Create weapon selection cards
            Object.entries(weapons2026).forEach(([weaponName, data]) => {
                const weaponCard = document.createElement('div');
                weaponCard.className = 'selection-card';
                weaponCard.dataset.weapon = weaponName;
                
                weaponCard.innerHTML = `
                    <i class="fas fa-crosshairs selection-icon"></i>
                    <div class="selection-name">${weaponName}</div>
                    <div class="selection-desc">${data.recomendacao}</div>
                `;
                
                weaponCard.addEventListener('click', () => {
                    // Remove active class from all cards
                    document.querySelectorAll('#weaponSelectionGrid .selection-card').forEach(card => {
                        card.classList.remove('active');
                    });
                    
                    // Add active class to clicked card
                    weaponCard.classList.add('active');
                    
                    // Display weapon settings
                    displayWeaponSettings(weaponName);
                });
                
                weaponSelectionGrid.appendChild(weaponCard);
            });
            
            // Activate first weapon by default
            if (weaponSelectionGrid.firstChild) {
                weaponSelectionGrid.firstChild.classList.add('active');
                displayWeaponSettings(Object.keys(weapons2026)[0]);
            }
        }
        
        function displayWeaponSettings(weaponName) {
            const settings = weapons2026[weaponName];
            currentSettings = {...settings, weapon: weaponName};
            currentType = "weapon";
            
            const displayContainer = document.getElementById('weaponSettingsDisplay');
            
            // Create settings display
            const settingsContent = document.createElement('div');
            settingsContent.innerHTML = `
                <div class="settings-grid">
                    <div class="setting-item" style="grid-column: 1 / -1;">
                        <div class="setting-label">Tipo de Arma</div>
                        <div class="setting-value" style="color: var(--secondary);">${weaponName}</div>
                        <div style="color: var(--primary); margin-top: 10px; font-size: 1.1rem;">${settings.descricao}</div>
                        <div style="color: rgba(240, 248, 255, 0.7); margin-top: 5px;">${settings.recomendacao}</div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Geral</div>
                        <div class="setting-value">${settings.geral}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira (Iron Sight)</div>
                        <div class="setting-value">${settings.mira}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Vermelha</div>
                        <div class="setting-value">${settings.reddot}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 2x</div>
                        <div class="setting-value">${settings.x2}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 4x</div>
                        <div class="setting-value">${settings.x4}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Sniper</div>
                        <div class="setting-value">${settings.miraSniper}<span class="setting-unit">%</span></div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="card-btn copy-btn" id="copyWeaponSettings">
                        <i class="far fa-copy"></i> Copiar Configurações
                    </button>
                </div>
            `;
            
            // Clear and update display
            displayContainer.innerHTML = '';
            displayContainer.appendChild(settingsContent);
            
            // Add copy functionality
            document.getElementById('copyWeaponSettings').addEventListener('click', copySettingsToClipboard);
        }
        
        function initDpiPage() {
            const dpiSelectionGrid = document.getElementById('dpiSelectionGrid');
            dpiSelectionGrid.innerHTML = '';
            
            // Create DPI selection cards
            Object.entries(dpiSettings2026).forEach(([dpiName, data]) => {
                const dpiCard = document.createElement('div');
                dpiCard.className = 'selection-card';
                dpiCard.dataset.dpi = dpiName;
                
                dpiCard.innerHTML = `
                    <i class="fas fa-sliders-h selection-icon"></i>
                    <div class="selection-name">${dpiName}</div>
                    <div class="selection-desc">${data.recomendacao}</div>
                `;
                
                dpiCard.addEventListener('click', () => {
                    // Remove active class from all cards
                    document.querySelectorAll('#dpiSelectionGrid .selection-card').forEach(card => {
                        card.classList.remove('active');
                    });
                    
                    // Add active class to clicked card
                    dpiCard.classList.add('active');
                    
                    // Display DPI settings
                    displayDpiSettings(dpiName);
                });
                
                dpiSelectionGrid.appendChild(dpiCard);
            });
            
            // Activate first DPI by default
            if (dpiSelectionGrid.firstChild) {
                dpiSelectionGrid.firstChild.classList.add('active');
                displayDpiSettings(Object.keys(dpiSettings2026)[0]);
            }
        }
        
        function displayDpiSettings(dpiName) {
            const settings = dpiSettings2026[dpiName];
            currentSettings = {...settings, dpiType: dpiName};
            currentType = "dpi";
            
            const displayContainer = document.getElementById('dpiSettingsDisplay');
            
            // Create settings display
            const settingsContent = document.createElement('div');
            settingsContent.innerHTML = `
                <div class="settings-grid">
                    <div class="setting-item" style="grid-column: 1 / -1;">
                        <div class="setting-label">Configuração de DPI</div>
                        <div class="setting-value" style="color: var(--secondary);">${dpiName}</div>
                        <div style="color: var(--primary); margin-top: 10px; font-size: 1.1rem;">${settings.descricao}</div>
                        <div style="color: rgba(240, 248, 255, 0.7); margin-top: 5px;">${settings.recomendacao}</div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">DPI Recomendado</div>
                        <div class="setting-value">${settings.dpi}<span class="setting-unit">DPI</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Sensibilidade Geral</div>
                        <div class="setting-value">${settings.sensibilidadeGeral}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira (Iron Sight)</div>
                        <div class="setting-value">${Math.floor(settings.sensibilidadeGeral * 0.9)}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira Vermelha</div>
                        <div class="setting-value">${Math.floor(settings.sensibilidadeGeral * 0.85)}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 2x</div>
                        <div class="setting-value">${Math.floor(settings.sensibilidadeGeral * 0.8)}<span class="setting-unit">%</span></div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-label">Mira 4x</div>
                        <div class="setting-value">${Math.floor(settings.sensibilidadeGeral * 0.75)}<span class="setting-unit">%</span></div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="card-btn copy-btn" id="copyDpiSettings">
                        <i class="far fa-copy"></i> Copiar Configurações
                    </button>
                </div>
            `;
            
            // Clear and update display
            displayContainer.innerHTML = '';
            displayContainer.appendChild(settingsContent);
            
            // Add copy functionality
            document.getElementById('copyDpiSettings').addEventListener('click', copySettingsToClipboard);
        }
        
        function copySettingsToClipboard() {
            let textToCopy = "⚡ Configurações Free Fire 2026 - MestreXit.ia VIP ⚡\n";
            textToCopy += "===========================================\n\n";
            
            if (currentSettings.player) {
                textToCopy += `👑 Jogador: ${currentSettings.player}\n`;
                textToCopy += `📝 Descrição: ${currentSettings.descricao}\n`;
                textToCopy += `🎮 Estilo: ${currentSettings.estilo}\n`;
                textToCopy += `🎯 Categoria: ${currentSettings.categoria === 'capa' ? '+ CAPA (Agresivo)' : '+ CONTROLE (Precisão)'}\n`;
                if (currentSettings.dpi) textToCopy += `📱 DPI: ${currentSettings.dpi}\n`;
            }
            
            if (currentSettings.setting && currentType === "twoThree") {
                textToCopy += `👆 Configuração: ${currentSettings.setting}\n`;
                textToCopy += `📝 Descrição: ${currentSettings.descricao}\n`;
                textToCopy += `🎯 Categoria: ${currentSettings.categoria === 'capa' ? '+ CAPA (Agresivo)' : '+ CONTROLE (Precisão)'}\n`;
                textToCopy += `💡 Recomendação: ${currentSettings.recomendacao}\n`;
                if (currentSettings.dpi) textToCopy += `📱 DPI: ${currentSettings.dpi}\n`;
            }
            
            if (currentSettings.weapon) {
                textToCopy += `🔫 Arma: ${currentSettings.weapon}\n`;
                textToCopy += `📝 Descrição: ${currentSettings.descricao}\n`;
                textToCopy += `💡 Recomendação: ${currentSettings.recomendacao}\n`;
            }
            
            if (currentSettings.dpiType) {
                textToCopy += `📱 Configuração DPI: ${currentSettings.dpiType}\n`;
                textToCopy += `📝 Descrição: ${currentSettings.descricao}\n`;
                textToCopy += `💡 Recomendação: ${currentSettings.recomendacao}\n`;
            }
            
            if (currentSettings.tipo && !currentSettings.player && !currentSettings.setting && !currentSettings.weapon && !currentSettings.dpiType) {
                textToCopy += `🎯 ${currentSettings.tipo}\n`;
                textToCopy += `📝 ${currentSettings.descricao}\n`;
            }
            
            textToCopy += "\n";
            textToCopy += "⚙️ CONFIGURAÇÕES DE SENSIBILIDADE (até 200%)\n";
            textToCopy += "-------------------------------------------\n";
            
            // Add settings
            if (currentSettings.geral) {
                textToCopy += `• Geral: ${currentSettings.geral}%\n`;
            }
            
            if (currentSettings.mira) {
                textToCopy += `• Mira (Iron Sight): ${currentSettings.mira}%\n`;
            }
            
            if (currentSettings.reddot) {
                textToCopy += `• Mira Vermelha / Holográfico: ${currentSettings.reddot}%\n`;
            }
            
            if (currentSettings.x2) {
                textToCopy += `• Mira 2x: ${currentSettings.x2}%\n`;
            }
            
            if (currentSettings.x4) {
                textToCopy += `• Mira 4x: ${currentSettings.x4}%\n`;
            }
            
            if (currentSettings.miraSniper) {
                textToCopy += `• Mira Sniper: ${currentSettings.miraSniper}%\n`;
            }
            
            if (currentSettings.dpi && !currentSettings.player && !currentSettings.setting) {
                textToCopy += `• DPI Recomendado: ${currentSettings.dpi}\n`;
            }
            
            if (currentSettings.sensibilidadeGeral && currentSettings.dpiType) {
                textToCopy += `• Sensibilidade Geral: ${currentSettings.sensibilidadeGeral}%\n`;
            }
            
            textToCopy += "\n";
            textToCopy += "✨ Gerado por MestreXit.ia VIP - A Nova Era do Free Fire 2026 ✨\n";
            textToCopy += "👨‍💻 Desenvolvido por MestreXit";
            
            // Copy to clipboard
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification("Configurações copiadas para a área de transferência! ✅");
            }).catch(err => {
                showNotification("Erro ao copiar as configurações. ❌", true);
            });
        }
        
        function showNotification(message, isError = false) {
            notification.textContent = message;
            notification.classList.toggle("error", isError);
            notification.style.display = "block";
            
            setTimeout(() => {
                notification.style.display = "none";
            }, 4000);
        }
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', init);
