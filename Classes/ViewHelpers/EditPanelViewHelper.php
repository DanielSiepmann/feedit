<?php

namespace TYPO3\CMS\Feedit\ViewHelpers;

/*
 * Copyright (C) 2020 Daniel Siepmann <coding@daniel-siepmann.de>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
 * 02110-1301, USA.
 */

use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3\CMS\Core\Database\ConnectionPool;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

class EditPanelViewHelper extends AbstractViewHelper
{
    protected $escapeChildren = false;

    protected $escapeOutput = false;

    public function initializeArguments()
    {
        $this->registerArgument('conf', 'array', '', false, []);
        $this->registerArgument('currentRecord', 'string', '', true);
        $this->registerArgument('dataArray', 'array', '', false, []);
    }

    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $contentObjectRenderer = GeneralUtility::makeInstance(ContentObjectRenderer::class);
        $record = $arguments['dataArray'];

        if ($record === []) {
            $record = static::getRecord($arguments['currentRecord']);
        }

        return $contentObjectRenderer->editPanel(
            '',
            $arguments['conf'],
            $arguments['currentRecord'],
            $record
        );
    }

    protected static function getRecord(string $currentRecord): array
    {
        [$table, $uid] = GeneralUtility::trimExplode(':', $currentRecord, true);
        /** @var ConnectionPool $connectionPool */
        $connectionPool = GeneralUtility::makeInstance(ConnectionPool::class);
        $connection = $connectionPool->getConnectionForTable($table);
        return $connection->select(['*'], $table, ['uid' => (int) $uid])->fetch() ?: [];
    }
}
