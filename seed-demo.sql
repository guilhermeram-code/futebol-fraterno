-- Script para criar campeonato demo "Copa Amigos 2026"
-- Campeonato completo com times, jogadores, jogos, estatísticas, galeria e patrocinadores

-- 1. Criar campeonato
INSERT INTO campaigns (slug, name, organizerName, logoUrl, heroBackgroundUrl, primaryColor, secondaryColor, accentColor, expiresAt, createdAt, updatedAt)
VALUES ('copa-amigos-2026', 'Copa Amigos 2026', 'Organização Amigos FC', '/demo/team1.jpg', NULL, '#10b981', '#f59e0b', '#3b82f6', DATE_ADD(NOW(), INTERVAL 6 MONTH), NOW(), NOW());

SET @campaign_id = LAST_INSERT_ID();

-- 2. Criar grupos
INSERT INTO groups (campaignId, name, `order`, createdAt, updatedAt) VALUES
(@campaign_id, 'Grupo A', 1, NOW(), NOW()),
(@campaign_id, 'Grupo B', 2, NOW(), NOW());

SET @group_a_id = (SELECT id FROM groups WHERE campaignId = @campaign_id AND name = 'Grupo A');
SET @group_b_id = (SELECT id FROM groups WHERE campaignId = @campaign_id AND name = 'Grupo B');

-- 3. Criar times (8 times - 4 por grupo)
INSERT INTO teams (campaignId, groupId, name, lodge, logoUrl, createdAt, updatedAt) VALUES
-- Grupo A
(@campaign_id, @group_a_id, 'Águias FC', 'Águias', '/demo/team1.jpg', NOW(), NOW()),
(@campaign_id, @group_a_id, 'Leões United', 'Leões', '/demo/team2.jpg', NOW(), NOW()),
(@campaign_id, @group_a_id, 'Tigres FC', 'Tigres', '/demo/team3.png', NOW(), NOW()),
(@campaign_id, @group_a_id, 'Falcões SC', 'Falcões', '/demo/team4.jpg', NOW(), NOW()),
-- Grupo B
(@campaign_id, @group_b_id, 'Lobos FC', 'Lobos', '/demo/team5.jpg', NOW(), NOW()),
(@campaign_id, @campaign_id, 'Panteras United', 'Panteras', '/demo/team6.png', NOW(), NOW()),
(@campaign_id, @group_b_id, 'Tubarões SC', 'Tubarões', '/demo/team7.png', NOW(), NOW()),
(@campaign_id, @group_b_id, 'Dragões FC', 'Dragões', '/demo/team8.png', NOW(), NOW());

-- Obter IDs dos times
SET @team1_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Águias FC');
SET @team2_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Leões United');
SET @team3_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Tigres FC');
SET @team4_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Falcões SC');
SET @team5_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Lobos FC');
SET @team6_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Panteras United');
SET @team7_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Tubarões SC');
SET @team8_id = (SELECT id FROM teams WHERE campaignId = @campaign_id AND name = 'Dragões FC');

-- 4. Criar jogadores (3 por time = 24 jogadores)
INSERT INTO players (campaignId, teamId, name, number, position, createdAt, updatedAt) VALUES
-- Águias FC
(@campaign_id, @team1_id, 'Carlos Silva', 10, 'Atacante', NOW(), NOW()),
(@campaign_id, @team1_id, 'Pedro Santos', 7, 'Meio-campo', NOW(), NOW()),
(@campaign_id, @team1_id, 'João Costa', 1, 'Goleiro', NOW(), NOW()),
-- Leões United
(@campaign_id, @team2_id, 'Rafael Oliveira', 9, 'Atacante', NOW(), NOW()),
(@campaign_id, @team2_id, 'Lucas Ferreira', 8, 'Meio-campo', NOW(), NOW()),
(@campaign_id, @team2_id, 'Marcos Lima', 1, 'Goleiro', NOW(), NOW()),
-- Tigres FC
(@campaign_id, @team3_id, 'Bruno Alves', 11, 'Atacante', NOW(), NOW()),
(@campaign_id, @team3_id, 'Diego Rocha', 6, 'Zagueiro', NOW(), NOW()),
(@campaign_id, @team3_id, 'Thiago Souza', 1, 'Goleiro', NOW(), NOW()),
-- Falcões SC
(@campaign_id, @team4_id, 'Gabriel Martins', 10, 'Atacante', NOW(), NOW()),
(@campaign_id, @team4_id, 'Felipe Ribeiro', 5, 'Zagueiro', NOW(), NOW()),
(@campaign_id, @team4_id, 'André Carvalho', 1, 'Goleiro', NOW(), NOW()),
-- Lobos FC
(@campaign_id, @team5_id, 'Ricardo Gomes', 9, 'Atacante', NOW(), NOW()),
(@campaign_id, @team5_id, 'Rodrigo Dias', 8, 'Meio-campo', NOW(), NOW()),
(@campaign_id, @team5_id, 'Paulo Mendes', 1, 'Goleiro', NOW(), NOW()),
-- Panteras United
(@campaign_id, @team6_id, 'Fernando Castro', 7, 'Atacante', NOW(), NOW()),
(@campaign_id, @team6_id, 'Gustavo Pinto', 4, 'Zagueiro', NOW(), NOW()),
(@campaign_id, @team6_id, 'Leonardo Nunes', 1, 'Goleiro', NOW(), NOW()),
-- Tubarões SC
(@campaign_id, @team7_id, 'Vinícius Barros', 11, 'Atacante', NOW(), NOW()),
(@campaign_id, @team7_id, 'Matheus Correia', 3, 'Zagueiro', NOW(), NOW()),
(@campaign_id, @team7_id, 'Daniel Moreira', 1, 'Goleiro', NOW(), NOW()),
-- Dragões FC
(@campaign_id, @team8_id, 'Alexandre Teixeira', 10, 'Atacante', NOW(), NOW()),
(@campaign_id, @team8_id, 'Renato Azevedo', 2, 'Lateral', NOW(), NOW()),
(@campaign_id, @team8_id, 'Fábio Monteiro', 1, 'Goleiro', NOW(), NOW());

-- 5. Criar jogos (12 jogos - 6 por grupo)
INSERT INTO matches (campaignId, groupId, homeTeamId, awayTeamId, homeScore, awayScore, matchDate, location, round, createdAt, updatedAt) VALUES
-- Grupo A - Rodada 1
(@campaign_id, @group_a_id, @team1_id, @team2_id, 3, 2, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Campo Central', 1, NOW(), NOW()),
(@campaign_id, @group_a_id, @team3_id, @team4_id, 1, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Campo Central', 1, NOW(), NOW()),
-- Grupo A - Rodada 2
(@campaign_id, @group_a_id, @team1_id, @team3_id, 2, 0, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Campo Central', 2, NOW(), NOW()),
(@campaign_id, @group_a_id, @team2_id, @team4_id, 4, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Campo Central', 2, NOW(), NOW()),
-- Grupo A - Rodada 3
(@campaign_id, @group_a_id, @team1_id, @team4_id, 2, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Campo Central', 3, NOW(), NOW()),
(@campaign_id, @group_a_id, @team2_id, @team3_id, 3, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Campo Central', 3, NOW(), NOW()),
-- Grupo B - Rodada 1
(@campaign_id, @group_b_id, @team5_id, @team6_id, 2, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Campo Sul', 1, NOW(), NOW()),
(@campaign_id, @group_b_id, @team7_id, @team8_id, 0, 3, DATE_SUB(NOW(), INTERVAL 15 DAY), 'Campo Sul', 1, NOW(), NOW()),
-- Grupo B - Rodada 2
(@campaign_id, @group_b_id, @team5_id, @team7_id, 1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Campo Sul', 2, NOW(), NOW()),
(@campaign_id, @group_b_id, @team6_id, @team8_id, 2, 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'Campo Sul', 2, NOW(), NOW()),
-- Grupo B - Rodada 3
(@campaign_id, @group_b_id, @team5_id, @team8_id, 3, 0, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Campo Sul', 3, NOW(), NOW()),
(@campaign_id, @group_b_id, @team6_id, @team7_id, 1, 0, DATE_SUB(NOW(), INTERVAL 5 DAY), 'Campo Sul', 3, NOW(), NOW());

-- 6. Registrar gols dos jogadores
-- Jogo 1: Águias 3 x 2 Leões
INSERT INTO player_stats (campaignId, playerId, goals, assists, yellowCards, redCards, createdAt, updatedAt)
SELECT @campaign_id, id, 2, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Carlos Silva'
UNION ALL
SELECT @campaign_id, id, 1, 1, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Pedro Santos'
UNION ALL
SELECT @campaign_id, id, 2, 0, 1, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Rafael Oliveira'
UNION ALL
-- Jogo 2: Tigres 1 x 1 Falcões
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Bruno Alves'
UNION ALL
SELECT @campaign_id, id, 1, 0, 1, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Gabriel Martins'
UNION ALL
-- Jogo 3: Águias 2 x 0 Tigres
SELECT @campaign_id, id, 1, 1, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Carlos Silva'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Pedro Santos'
UNION ALL
-- Jogo 4: Leões 4 x 1 Falcões
SELECT @campaign_id, id, 3, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Rafael Oliveira'
UNION ALL
SELECT @campaign_id, id, 1, 2, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Lucas Ferreira'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Gabriel Martins'
UNION ALL
-- Jogo 5: Águias 2 x 2 Falcões
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Carlos Silva'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Pedro Santos'
UNION ALL
SELECT @campaign_id, id, 2, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Gabriel Martins'
UNION ALL
-- Jogo 6: Leões 3 x 1 Tigres
SELECT @campaign_id, id, 2, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Rafael Oliveira'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Lucas Ferreira'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Bruno Alves'
UNION ALL
-- Jogo 7: Lobos 2 x 1 Panteras
SELECT @campaign_id, id, 2, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Ricardo Gomes'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Fernando Castro'
UNION ALL
-- Jogo 8: Tubarões 0 x 3 Dragões
SELECT @campaign_id, id, 2, 1, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Alexandre Teixeira'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Renato Azevedo'
UNION ALL
-- Jogo 9: Lobos 1 x 1 Tubarões
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Ricardo Gomes'
UNION ALL
SELECT @campaign_id, id, 1, 0, 1, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Vinícius Barros'
UNION ALL
-- Jogo 10: Panteras 2 x 2 Dragões
SELECT @campaign_id, id, 2, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Fernando Castro'
UNION ALL
SELECT @campaign_id, id, 2, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Alexandre Teixeira'
UNION ALL
-- Jogo 11: Lobos 3 x 0 Dragões
SELECT @campaign_id, id, 2, 1, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Ricardo Gomes'
UNION ALL
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Rodrigo Dias'
UNION ALL
-- Jogo 12: Panteras 1 x 0 Tubarões
SELECT @campaign_id, id, 1, 0, 0, 0, NOW(), NOW() FROM players WHERE campaignId = @campaign_id AND name = 'Fernando Castro';

-- 7. Adicionar fotos na galeria
INSERT INTO photos (campaignId, imageUrl, caption, createdAt, updatedAt) VALUES
(@campaign_id, '/demo/photo1.jpg', 'Disputa acirrada pela bola no meio de campo', NOW(), NOW()),
(@campaign_id, '/demo/photo2.jpg', 'Comemoração do gol da vitória', NOW(), NOW()),
(@campaign_id, '/demo/photo3.jpg', 'Time comemorando a classificação', NOW(), NOW()),
(@campaign_id, '/demo/photo4.jpg', 'Foto oficial do time campeão', NOW(), NOW());

-- 8. Adicionar patrocinadores
INSERT INTO sponsors (campaignId, name, logoUrl, websiteUrl, `order`, createdAt, updatedAt) VALUES
(@campaign_id, 'Fly Emirates', '/demo/sponsor1.png', 'https://www.emirates.com', 1, NOW(), NOW()),
(@campaign_id, 'Penalty', '/demo/sponsor2.jpg', 'https://www.penalty.com.br', 2, NOW(), NOW()),
(@campaign_id, 'Esportes da Sorte', '/demo/sponsor3.jpg', 'https://www.esportesdasorte.com', 3, NOW(), NOW());

-- 9. Adicionar comentários
INSERT INTO comments (campaignId, authorName, content, createdAt, updatedAt) VALUES
(@campaign_id, 'João Torcedor', 'Que campeonato incrível! Os jogos estão muito disputados!', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(@campaign_id, 'Maria Silva', 'Parabéns pela organização! Site ficou top demais!', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(@campaign_id, 'Pedro Souza', 'Águias FC jogando muito! Favoritos ao título!', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(@campaign_id, 'Ana Costa', 'Rafael Oliveira está imparável! Artilheiro disparado!', NOW(), NOW());

-- 10. Adicionar avisos
INSERT INTO announcements (campaignId, title, content, isActive, createdAt, updatedAt) VALUES
(@campaign_id, 'Semifinais definidas!', 'As chaves do mata-mata já estão disponíveis. Confira os confrontos!', 1, NOW(), NOW());

SELECT 'Campeonato Copa Amigos 2026 criado com sucesso!' as resultado, 
       @campaign_id as campaign_id,
       'https://peladapro.com.br/copa-amigos-2026' as url;
